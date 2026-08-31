const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });

const cleanText = (value) =>
  String(value ?? "")
    .replace(/\r/g, "")
    .trim();

export async function onRequestPost(context) {
  try {
    const request = context.request;

    // Only accept JSON
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return json(
        { ok: false, error: "Invalid request." },
        415
      );
    }

    // Basic same-origin check
    const origin = request.headers.get("Origin");
    const requestURL = new URL(request.url);

    if (origin && origin !== requestURL.origin) {
      return json(
        { ok: false, error: "Forbidden." },
        403
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        { ok: false, error: "Invalid request body." },
        400
      );
    }

    const name = cleanText(body.name);
    const email = cleanText(body.email);
    const message = cleanText(body.message);
    const website = cleanText(body.website);

    // Honeypot: humans never fill this in
    if (website) {
      return json({ ok: true });
    }

    if (!name || name.length > 80) {
      return json(
        { ok: false, error: "Please enter a valid name." },
        400
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return json(
        { ok: false, error: "Please enter a valid email address." },
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
          error: "Message must contain between 10 and 5000 characters."
        },
        400
      );
    }

    if (!context.env.RESEND_API_KEY || !context.env.CONTACT_TO) {
      console.error("Missing email environment variables.");

      return json(
        { ok: false, error: "Email service is unavailable." },
        500
      );
    }

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",

          // Required for direct Resend REST API calls
          "User-Agent": "mustaqim-portfolio/1.0"
        },

        body: JSON.stringify({
          from: "Mustaqim Portfolio <onboarding@resend.dev>",

          to: [
            context.env.CONTACT_TO
          ],

          reply_to: email,

          subject: `Portfolio Contact — ${name}`,

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

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend error:",
        JSON.stringify(resendResult)
      );

      return json(
        {
          ok: false,
          error: "The message could not be sent. Please try again."
        },
        502
      );
    }

    return json({
      ok: true,
      message: "Message sent successfully."
    });

  } catch (error) {
    console.error("Contact API error:", error);

    return json(
      {
        ok: false,
        error: "Something went wrong. Please try again."
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
