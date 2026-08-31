export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const isProtectedImage =
    url.pathname.startsWith("/assets/") &&
    /\.(png|jpg|jpeg|webp|gif|avif|svg)$/i.test(url.pathname);

  if (isProtectedImage) {
    const destination = request.headers.get("Sec-Fetch-Dest");
    const site = request.headers.get("Sec-Fetch-Site");

    const loadedAsImage = destination === "image";

    const fromMySite =
      site === "same-origin" ||
      site === "same-site";

    if (!loadedAsImage || !fromMySite) {
      const errorURL = new URL("/404", url.origin);

      const errorPage =
        await context.env.ASSETS.fetch(errorURL);

      const headers = new Headers(errorPage.headers);

      headers.set(
        "Content-Type",
        "text/html; charset=UTF-8"
      );

      headers.set("Cache-Control", "no-store");

      return new Response(errorPage.body, {
        status: 404,
        statusText: "Not Found",
        headers
      });
    }
  }

  return context.next();
}
