// /api/ra-proxy  — Vercel serverless function (no key needed).
// Pulls Resident Advisor's live Brussels agenda (today → +14 days) straight from
// ra.co/graphql, including each event's real poster (flyerFront). Same-origin, so
// the browser app calls /api/ra-proxy with no CORS issues. RA's GraphQL is public
// but unofficial — be a good citizen (this caches for 30 min) and check RA's terms.

const RA_URL = "https://ra.co/graphql";
const HEADERS = {
  "Content-Type": "application/json",
  Referer: "https://ra.co/events",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function gql(query, variables) {
  const r = await fetch(RA_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`RA responded ${r.status}`);
  const json = await r.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "GraphQL error");
  return json.data;
}

// Resolve the Brussels area code by name so nothing is hardcoded/guessed.
async function brusselsAreaId() {
  const d = await gql(
    `query($s: String!){ areas(searchTerm: $s, limit: 8){ id name country { name } } }`,
    { s: "brussels" }
  );
  const list = d.areas || [];
  const be =
    list.find((a) => a.country?.name === "Belgium" && /brussel/i.test(a.name)) ||
    list.find((a) => a.country?.name === "Belgium") ||
    list[0];
  return be?.id;
}

const LISTINGS = `query($filters: FilterInputDtoInput, $page: Int, $pageSize: Int){
  eventListings(filters: $filters, pageSize: $pageSize, page: $page){
    data { event {
      id title date startTime endTime contentUrl flyerFront attending
      venue { name } artists { name } genres { name }
    } }
    totalResults
  }
}`;

// Page through the whole result set — RA caps pageSize, so a 2-week window
// spans several pages. Without this, busy days come back truncated.
async function allListings(filters) {
  const pageSize = 50;
  let page = 1, total = Infinity;
  const rows = [];
  while (rows.length < total && page <= 30) {
    const data = await gql(LISTINGS, { filters, page, pageSize });
    const listing = data?.eventListings;
    total = listing?.totalResults ?? rows.length;
    const batch = listing?.data || [];
    if (!batch.length) break;
    rows.push(...batch);
    page++;
  }
  return rows;
}

function tagFor(title, venue) {
  const s = `${title} ${venue}`.toLowerCase();
  return /festival|open ?air|open-air/.test(s) ? "Festival" : "Clubbing";
}

export default async function handler(req, res) {
  try {
    const WINDOW_DAYS = Number(req.query?.days) || 14;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const end = new Date(today.getTime() + WINDOW_DAYS * 864e5);
    end.setUTCHours(23, 59, 59, 999);

    const areaId = await brusselsAreaId();
    if (!areaId) return res.status(502).json({ error: "Could not resolve Brussels area id" });

    const rows = await allListings({
      areas: { eq: Number(areaId) },
      listingDate: { gte: today.toISOString(), lte: end.toISOString() },
    });
    const events = rows
      .map(({ event: e }) => ({
        id: String(e.id),
        title: e.title,
        venue: { name: e.venue?.name || "Brussels", address: "Brussels" },
        tag: tagFor(e.title, e.venue?.name || ""),
        date: (e.date || "").slice(0, 10),
        startTime: (e.startTime || "").slice(11, 16),
        endTime: (e.endTime || "").slice(11, 16),
        genres: (e.genres || []).map((g) => g.name),
        artists: (e.artists || []).map((a) => a.name),
        cost: "",
        minAge: "",
        interested: e.attending || 0,
        image: e.flyerFront || "",
        contentUrl: "https://ra.co" + (e.contentUrl || ""),
      }))
      .filter((e) => e.date);

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    res.status(200).json(events);
  } catch (err) {
    res.status(502).json({ error: String(err?.message || err) });
  }
}
