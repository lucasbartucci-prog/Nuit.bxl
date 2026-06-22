// /api/ra-image?u=<encoded RA image url>
// Streams a Resident Advisor poster through our own origin with an ra.co referer,
// so the browser never hotlinks RA's CDN directly (which can be refused) and there
// are no mixed-content/CORS issues. Only RA image hosts are allowed.

const ALLOWED = /^https:\/\/(imgproxy\.ra\.co|images\.ra\.co|[a-z0-9-]+\.ra\.co|ra\.co)\//i;

export default async function handler(req, res) {
  try {
    const raw = req.query?.u;
    if (!raw) return res.status(400).send("missing u");
    const url = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);
    if (!ALLOWED.test(url)) return res.status(400).send("blocked host");

    const upstream = await fetch(url, {
      headers: {
        Referer: "https://ra.co/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!upstream.ok) return res.status(upstream.status).send(`upstream ${upstream.status}`);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(buf);
  } catch {
    res.status(502).send("image proxy error");
  }
}
