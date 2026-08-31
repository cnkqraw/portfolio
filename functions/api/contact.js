const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });

const cleanText = (value) =>
  String(value ?? "")
    .replace(/\r/g, "")
    .trim();

async function hashValue(value) {
  const encoded = new TextEncoder().encode(value);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoded
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyTurnstile(context, token) {
  if (
    !context.env.TURNSTILE_SECRET ||
    !token ||
    token.length > 2048
  ) {
    return false;
  }

  const ip =
    context.request.headers.get("CF-Connecting-IP") || "";

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({
          secret: context.env.TURNSTILE_SECRET,
          response: token,
          remoteip: ip
        })
      }
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();

    return (
      result.success === true &&
      result.hostname === "mustaqim.is-a.dev" &&
      result.action === "contact"
    );

  } catch (error) {
    console.error(
      "Turnstile verification error:",
      error
    );

    return false;
  }
}

async function checkRateLimit(context) {
  const ip =
    context.request.headers.get("CF-Connecting-IP");

  // On the actual Cloudflare network this should exist.
  if (!ip) {
    return {
      allowed: false,
      retryAfter: 60
    };
  }

  if (!context.env.CONTACT_RATE_LIMIT) {
    console.error(
      "CONTACT_RATE_LIMIT binding is missing."
    );

    return {
      allowed: false,
      retryAfter: 60
    };
  }

  const WINDOW_SECONDS = 600;
  const MAX_REQUESTS = 5;

  const now = Math.floor(Date.now() / 1000);

  const windowNumber =
    Math.floor(now / WINDOW_SECONDS);

  const windowEnd =
    (windowNumber + 1) * WINDOW_SECONDS;

  const retryAfter =
    Math.max(1, windowEnd - now);

  // Don't store the raw IP in KV.
  const ipHash = await hashValue(ip);

  const key =
    `contact:${ipHash}:${windowNumber}`;

  const existing =
    await context.env.CONTACT_RATE_LIMIT.get(key);

  const count =
    Number.parseInt(existing || "0", 10);

  if (count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter
    };
  }

  await context.env.CONTACT_RATE_LIMIT.put(
    key,
    String(count + 1),
    {
      expirationTtl:
        WINDOW_SECONDS + 60
    }
  );

  return {
    allowed: true,
    retryAfter
  };
}

export async function onRequestPost(context) {
  try {
    const request = context.request;

    /*
     * 1. Basic content-type check
     */
    const contentType =
      request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return json(
        {
          ok: false,
          error: "Invalid request."
        },
        415
      );
    }

    /*
     * 2. Basic same-origin browser protection
     *
     * Helpful, but not relied on as the main
     * security mechanism.
     */
    const origin =
      request.headers.get("Origin");

    const requestURL =
      new URL(request.url);

    if (
      origin &&
      origin !== requestURL.origin
    ) {
      return json(
        {
          ok: false,
          error: "Forbidden."
        },
        403
      );
    }

    /*
     * 3. Parse request
     */
    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        {
          ok: false,
          error: "Invalid request body."
        },
        400
      );
    }

    const name =
      cleanText(body.name);

    const email =
      cleanText(body.email);

    const message =
      cleanText(body.message);

    const website =
      cleanText(body.website);

    const turnstileToken =
      cleanText(body.turnstileToken);

    /*
     * 4. Honeypot
     *
     * Pretend everything worked so basic
     * spam bots don't learn why they failed.
     */
    if (website) {
      return json({
        ok: true
      });
    }

    /*
     * 5. Validate input
     */
    if (
      !name ||
      name.length > 80
    ) {
      return json(
        {
          ok: false,
          error: "Please enter a valid name."
        },
        400
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return json(
        {
          ok: false,
          error:
            "Please enter a valid email address."
        },
        400
      );
    }

    if (
      !message ||
      message.length < 10 ||
      message.length > 5000
    ) {
      return json(
        {
          ok: false,
          error:
            "Message must contain between 10 and 5000 characters."
        },
        400
      );
    }

    /*
     * 6. Verify Turnstile
     */
    const human =
      await verifyTurnstile(
        context,
        turnstileToken
      );

    if (!human) {
      return json(
        {
          ok: false,
          error:
            "Security verification failed. Please try again."
        },
        403
      );
    }

    /*
     * 7. Rate limit
     */
    const rateLimit =
      await checkRateLimit(context);

    if (!rateLimit.allowed) {
      return json(
        {
          ok: false,
          error:
            "Too many messages. Please wait a few minutes and try again."
        },
        429,
        {
          "Retry-After":
            String(rateLimit.retryAfter)
        }
      );
    }

    /*
     * 8. Check email configuration
     */
    if (
      !context.env.RESEND_API_KEY ||
      !context.env.CONTACT_TO
    ) {
      console.error(
        "Missing email environment variables."
      );

      return json(
        {
          ok: false,
          error:
            "Email service is unavailable."
        },
        500
      );
    }

    /*
     * 9. Send through Resend
     */
    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${context.env.RESEND_API_KEY}`,

            "Content-Type":
              "application/json",

            "User-Agent":
              "mustaqim-portfolio/1.0"
          },

          body: JSON.stringify({
            from:
              "Mustaqim Portfolio <onboarding@resend.dev>",

            to: [
              context.env.CONTACT_TO
            ],

            reply_to: email,

            subject:
              `Portfolio Contact — ${name}`,

            text:
`New message from mustaqim.is-a.dev

Name:
${name}

Email:
${email}

Message:
${message}

---
Sent through the portfolio contact form.`
          })
        }
      );

    const resendResult =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend error:",
        JSON.stringify(resendResult)
      );

      return json(
        {
          ok: false,
          error:
            "The message could not be sent. Please try again."
        },
        502
      );
    }

    return json({
      ok: true,
      message:
        "Message sent successfully."
    });

  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "Something went wrong. Please try again."
      },
      500
    );
  }
}

export function onRequestGet() {
  return json(
    {
      ok: false,
      error: "Method not allowed."
    },
    405
  );
}
