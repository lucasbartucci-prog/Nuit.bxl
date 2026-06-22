import React, { useState, useMemo, useEffect, useRef } from "react";

/* ============================================================================
   NUIT.BXL — Brussels nightlife catalogue
   Design: Lucas / (its)Lucas — recreated from the Figma flow.

   DATA: real Resident Advisor — Brussels listings (ra.co/events/be/brussels).
   Each event below was pulled from its RA page: title, venue, date/time,
   line-up, genres, cost, interested count, and the real RA flyer image.
   `image` is RA's og:image (1200x630). The full-aspect flyer used in the
   detail sheet is derived from the same source via `fullFlyer()`.

   RA has no official public API. To go live with a fresh feed, front RA's
   unofficial GraphQL (ra.co/graphql) with the proxy at the bottom of this file
   and swap the mock loader for `fetchEvents()`. Shapes already match.
   ========================================================================== */

const LIME = "#C8F135";

/* og:image -> original full flyer (keeps the whole poster, not the 1200x630 crop) */
function fullFlyer(ogUrl) {
  return ogUrl ? ogUrl.replace("/rt:fill/h:630/w:1200/quality:50/", "/quality:66/") : "";
}

/* ---- Real RA — Brussels listings ------------------------------------------ */
const EVENTS = [
  {"id": "2422544", "title": "VERSION by Yard One, Encore Dub & Æther", "venue": {"name": "Bodies in Space", "address": "65 Chaussée de Zellik, Berchem-Sainte-Agathe"}, "tag": "Clubbing", "date": "2026-06-05", "startTime": "22:00", "endTime": "06:00", "genres": ["Bass", "Dub"], "artists": ["Gorgon Sound", "Reemshot", "Maquis Son Sistèm", "Elvira", "Fatale Furylax", "Subsism", "Maliman", "Dub Punishers", "Encore Dub Crew"], "cost": "€15–25", "minAge": "18+", "interested": 693, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vNTIzNmQxNTU3MmQ4ZmJmMDIwMjA4ZWY1ZGY2ZjU2MjBjYTMzYWNkZS5qcGc=", "contentUrl": "https://ra.co/events/2422544"},
  {"id": "2409236", "title": "18HRS of Fuse: Open Air & Club", "venue": {"name": "Fuse", "address": "Blaesstraat 208, 1000 Brussels"}, "tag": "Festival", "date": "2026-06-06", "startTime": "14:00", "endTime": "07:00", "genres": ["Techno"], "artists": ["Temudo", "Cirkle", "Altinbas", "Downside", "Freddy K", "Setaoc Mass", "BLANKA", "Marie-Julie", "Phemia"], "cost": "€14–25", "minAge": "18+", "interested": 135, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vYmRkMDcxMTFmMjZlODdlZmE5M2IwNzYxMjA5ZWRlZDQ5OTkxMDZmYi5qcGc=", "contentUrl": "https://ra.co/events/2409236"},
  {"id": "2423679", "title": "Fuse presents: Acid Arab (DJ set) & Lefto Early Bird", "venue": {"name": "Fuse", "address": "Blaesstraat 208, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-05", "startTime": "23:00", "endTime": "07:00", "genres": ["Techno"], "artists": ["Acid Arab", "Lefto Early Bird", "O'SIMMIE", "Rrita Jashari"], "cost": "€20", "minAge": "18+", "interested": 122, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vNzA4ZjZjNDM0NjgwMmZlZTI5MTlkOWNhOTM3ODM3OTkxZjY2NTc2ZC5qcGc=", "contentUrl": "https://ra.co/events/2423679"},
  {"id": "2452311", "title": "WAMM Afterparty", "venue": {"name": "C12", "address": "116 rue Marché aux Herbes, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-06", "startTime": "23:00", "endTime": "05:00", "genres": ["Bass", "Electronica"], "artists": ["Tim Exile", "Animistic Beliefs", "ALEA(s)", "B_ke", "Krasius"], "cost": "€15", "minAge": "18+", "interested": 48, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vNjI2MGE2NTNmYTAwYTNhYjBhMTRjYWYxNTQzMGM1NDNlYTgwY2ZjYi5qcGc=", "contentUrl": "https://ra.co/events/2452311"},
  {"id": "2428977", "title": "Chevry Showcase x UMI", "venue": {"name": "UMI", "address": "Rue du Marché aux Fromages 10, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-05", "startTime": "23:00", "endTime": "06:00", "genres": ["Trance", "Electro"], "artists": ["Emma B", "HearThug", "Occibel", "NAD!NE"], "cost": "", "minAge": "", "interested": 63, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vYTY1MzE0NmZmMjNlNjYxNzVlMzgwNGU5Yzc0MWFmM2Y0YmVlZTA2OC5qcGc=", "contentUrl": "https://ra.co/events/2428977"},
  {"id": "2431584", "title": "C12 Nite with DINA, Nefeli, Sookie, STDJ", "venue": {"name": "C12", "address": "116 rue Marché aux Herbes, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-06", "startTime": "23:59", "endTime": "06:00", "genres": ["Progressive House", "Techno"], "artists": ["DINA", "Nefeli", "Sookie", "STDJ"], "cost": "", "minAge": "", "interested": 22, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vMGExZGQ2YmEyYjRlOWFjMTI5MzI5YTFkY2MzMzM5MDIwNDU5MTk2Zi5wbmc=", "contentUrl": "https://ra.co/events/2431584"},
  {"id": "2455321", "title": "HEEZE with PsyOps", "venue": {"name": "UMI", "address": "Rue du Marché aux Fromages 10, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-07", "startTime": "08:00", "endTime": "15:00", "genres": ["Minimal", "Minimal Techno"], "artists": ["SHY", "PsyOps", "IAGO"], "cost": "", "minAge": "", "interested": 25, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vNzdkYjQ4ODFkYmEyNjk2YjU1NTYyYjY2MjE0NjkxYmVjYWIxYzg3Yi5qcGc=", "contentUrl": "https://ra.co/events/2455321"},
  {"id": "2373004", "title": "Anyma pres. ÆDEN - Cinquantenaire Open Air", "venue": {"name": "Parc du Cinquantenaire", "address": "Parc du Cinquantenaire, Brussels"}, "tag": "Festival", "date": "2026-06-06", "startTime": "14:00", "endTime": "23:00", "genres": ["Techno"], "artists": ["Anyma"], "cost": "", "minAge": "18+", "interested": 43, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vYjAxNTc5NzI2Y2ZjNDIzNGMzZjc5NmNmYTMzYWUxNDIwNzMzYjlkMC5qcGc=", "contentUrl": "https://ra.co/events/2373004"},
  {"id": "2440176", "title": "BLUR with Reptant (live), Poppy", "venue": {"name": "UMI", "address": "Rue du Marché aux Fromages 10, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-06", "startTime": "23:59", "endTime": "07:00", "genres": ["House", "Electro"], "artists": ["Giorgi Pipia", "Reptant", "Ava Eva", "SVS", "Poppy"], "cost": "", "minAge": "", "interested": 13, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vZDgxZjc0ODk2ZmMyZjkwNDVmODNkODMxMTkzOWZmY2EzY2RlNjE4Ny5qcGc=", "contentUrl": "https://ra.co/events/2440176"},
  {"id": "2427259", "title": "Thé Dansant Select II (Bourse Rooftop)", "venue": {"name": "Belgian Beer World", "address": "Bd Anspach 80, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-06", "startTime": "20:00", "endTime": "02:00", "genres": ["House", "Afro House"], "artists": ["Aytiwan", "Don Cabron", "Jaxter", "RELO4D"], "cost": "", "minAge": "21+", "interested": 3, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vNDdhOGE1ZDg5MzgzNWRkNTU2ZmZhNTA4M2FjYmYyNWRlMmFkMzNlZC5wbmc=", "contentUrl": "https://ra.co/events/2427259"},
  {"id": "2437443", "title": "C12 Open Air Afterparty", "venue": {"name": "C12", "address": "116 rue Marché aux Herbes, 1000 Brussels"}, "tag": "Clubbing", "date": "2026-06-20", "startTime": "23:00", "endTime": "06:00", "genres": ["House", "Club"], "artists": ["Byron Yeates", "VTT (BE)", "Kathleen C", "Stanislawa"], "cost": "", "minAge": "18+", "interested": 18, "image": "https://imgproxy.ra.co/_/rt:fill/h:630/w:1200/quality:50/aHR0cHM6Ly9pbWFnZXMucmEuY28vZDM1NzdiMmVkYTQzZjRhYzc2ZWNlY2Y2YjMyNTQyNmExZWI1YzdiNS5wbmc=", "contentUrl": "https://ra.co/events/2437443"},
  {"id": "couleurcafe-fri", "title": "Couleur Café — Friday", "venue": {"name": "Parc d'Osseghem", "address": "Ossegempark, Atomium, Brussels"}, "tag": "Festival", "date": "2026-06-26", "startTime": "16:00", "endTime": "02:00", "genres": ["World", "Urban", "Reggae"], "artists": [], "cost": "Day / combi tickets", "minAge": "All ages", "interested": 0, "image": "", "contentUrl": "https://www.couleurcafe.be/en/"},
  {"id": "couleurcafe-sat", "title": "Couleur Café — Saturday", "venue": {"name": "Parc d'Osseghem", "address": "Ossegempark, Atomium, Brussels"}, "tag": "Festival", "date": "2026-06-27", "startTime": "15:00", "endTime": "02:00", "genres": ["World", "Urban", "Hip-Hop"], "artists": [], "cost": "Day / combi tickets", "minAge": "All ages", "interested": 0, "image": "", "contentUrl": "https://www.couleurcafe.be/en/"},
  {"id": "couleurcafe-sun", "title": "Couleur Café — Sunday", "venue": {"name": "Parc d'Osseghem", "address": "Ossegempark, Atomium, Brussels"}, "tag": "Festival", "date": "2026-06-28", "startTime": "15:00", "endTime": "02:00", "genres": ["World", "Dub", "Afro"], "artists": [], "cost": "Day / combi tickets", "minAge": "All ages", "interested": 0, "image": "", "contentUrl": "https://www.couleurcafe.be/en/"},
  {"id": "xrds-pawlowski", "title": "XRDS Festival: Pawlowski & CAIVA", "venue": {"name": "Fuse", "address": "Blaesstraat 208, 1000 Brussels"}, "tag": "Festival", "date": "2026-06-27", "startTime": "23:00", "endTime": "07:00", "genres": ["Techno", "House"], "artists": ["Pawlowski", "CAIVA", "Madpace", "Maëlle"], "cost": "€15 presale / €20 doors", "minAge": "18+", "interested": 0, "image": "", "contentUrl": "https://www.fuse.be/events/fuse-presents-pawlowski-caiva"},
  {"id": "xrds-jul3", "title": "XRDS Festival: Samuel Moriero, KX CHR", "venue": {"name": "Fuse", "address": "Blaesstraat 208, 1000 Brussels"}, "tag": "Festival", "date": "2026-07-03", "startTime": "23:00", "endTime": "07:00", "genres": ["Techno"], "artists": ["Samuel Moriero", "KX CHR", "SWART", "Lena De Roose"], "cost": "€15 presale / €20 doors", "minAge": "18+", "interested": 0, "image": "", "contentUrl": "https://www.fuse.be/events/xrds-festival-2026"},
  {"id": "xrds-jul4", "title": "XRDS Festival: Border One, Hadone, Phara", "venue": {"name": "Fuse", "address": "Blaesstraat 208, 1000 Brussels"}, "tag": "Festival", "date": "2026-07-04", "startTime": "22:00", "endTime": "07:00", "genres": ["Techno"], "artists": ["Rene Wise", "AMORAL", "Phil Berg & Lobster", "ANNĒ", "Border One", "Hadone", "Phara"], "cost": "€15 presale / €20 doors", "minAge": "18+", "interested": 0, "image": "", "contentUrl": "https://www.fuse.be/events/xrds-festival-2026"},
  {"id": "holidays-recyclart", "title": "Holidays: Naga Kirana + Rebel Up Sebcat", "venue": {"name": "Recyclart", "address": "Rue de Manchester 13-15, Molenbeek"}, "tag": "Clubbing", "date": "2026-06-25", "startTime": "18:00", "endTime": "02:00", "genres": ["Global", "Eclectic"], "artists": ["Naga Kirana", "Rebel Up Sebcat", "Drache Mumu"], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
  {"id": "district10-umi", "title": "District 10 x Bonne Nuit: Studio Takeover", "venue": {"name": "UMI", "address": "Rue du Marché aux Fromages 10, Brussels"}, "tag": "Clubbing", "date": "2026-06-26", "startTime": "23:00", "endTime": "06:00", "genres": ["House", "Techno"], "artists": [], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
  {"id": "soluna-society", "title": "Soluna invites Samantha Loveridge", "venue": {"name": "Society — Boiler Club", "address": "Rue Duquesnoy 14, Brussels"}, "tag": "Clubbing", "date": "2026-06-26", "startTime": "23:00", "endTime": "05:00", "genres": ["House"], "artists": ["Samantha Loveridge"], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
  {"id": "afrobase-mirano", "title": "Afrobase", "venue": {"name": "Mirano", "address": "Chaussée de Louvain 38, Brussels"}, "tag": "Clubbing", "date": "2026-06-27", "startTime": "23:00", "endTime": "06:00", "genres": ["Afro", "Global"], "artists": [], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
  {"id": "montdesarts-pp", "title": "Mont des Arts Party: Back 2 Music 2000-2010", "venue": {"name": "Plein Publiek BXL", "address": "Bd du Jardin Botanique 50, Brussels"}, "tag": "Clubbing", "date": "2026-06-27", "startTime": "23:30", "endTime": "05:00", "genres": ["Throwback", "Pop"], "artists": [], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
  {"id": "society-loulou", "title": "Society invites Loulou Players", "venue": {"name": "Society — Boiler Club", "address": "Rue Duquesnoy 14, Brussels"}, "tag": "Clubbing", "date": "2026-06-27", "startTime": "23:00", "endTime": "06:00", "genres": ["House"], "artists": ["Loulou Players"], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
  {"id": "blur-umi-jun27", "title": "BLUR: OK EG (live), Thaïs, Bobbi Watson", "venue": {"name": "UMI", "address": "Rue du Marché aux Fromages 10, Brussels"}, "tag": "Clubbing", "date": "2026-06-27", "startTime": "23:59", "endTime": "07:00", "genres": ["House", "Electro"], "artists": ["OK EG", "Thaïs", "Bobbi Watson", "Metizo", "Leef"], "cost": "", "minAge": "", "interested": 0, "image": "", "contentUrl": "https://www.visit.brussels/en/visitors/agenda"},
];

/* ---- Generative flyer art (fallback only, if an RA image fails to load) ---- */
const PALETTES = [
  ["#FF3D7F", "#3D3DFF", "#C8F135"], ["#0B0B0B", "#FF5A1F", "#FFE600"],
  ["#7B2FF7", "#F107A3", "#00E0FF"], ["#00C2A8", "#0B3D91", "#C8F135"],
  ["#FF006E", "#FB5607", "#FFBE0B"], ["#3A0CA3", "#F72585", "#4CC9F0"],
];
function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}
function PosterArt({ event }) {
  const seed = seedFrom(event.id);
  const pal = PALETTES[seed % PALETTES.length];
  const angle = 25 + (seed % 130);
  return (
    <div className="poster" style={{ background: `linear-gradient(${angle}deg, ${pal[0]}, ${pal[1]}, ${pal[2]})` }} aria-hidden="true">
      <div className="poster__title">
        {event.title.split(" ").slice(0, 5).map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  );
}

/* ---- Date helpers + rolling window ----------------------------------------
   The list always reads from "today" and caps at WINDOW_DAYS (2 weeks).
   LIVE = true once the RA proxy feeds fresh events (today→+14d, self-updating).
   While LIVE = false this static snapshot has no events in the live window, so
   we fall back to the most recent 2 weeks of snapshot data and flag it, instead
   of showing an empty screen. Either way the windowing logic is identical. */
const WINDOW_DAYS = 14;
const LIVE = false;

const DAYNAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
}
function ddmm(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* Decide the active 2-week window and which events fall inside it. */
function computeWindow(events) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);
  const endISO = toISO(addDays(today, WINDOW_DAYS));
  // Frontend shows ONLY upcoming events (today → +2 weeks). Past events never render.
  const windowed = events
    .filter((e) => e.date >= todayISO && e.date <= endISO)
    .sort((a, b) => (a.date === b.date ? b.interested - a.interested : a.date.localeCompare(b.date)));
  return { todayISO, windowed };
}

export default function App() {
  // Live RA agenda from the proxy (when deployed); static list as fallback.
  const [liveEvents, setLiveEvents] = useState(null);
  useEffect(() => {
    let off = false;
    fetch("/api/ra-proxy")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (!off && Array.isArray(d) && d.length) setLiveEvents(d); })
      .catch(() => {/* no proxy (local/artifact) — keep static list */});
    return () => { off = true; };
  }, []);
  const source = liveEvents || EVENTS;

  // Upcoming events only, on their real fixed dates.
  const { windowed } = useMemo(() => computeWindow(source), [source]);

  // Nights = distinct upcoming dates, chronological.
  const nights = useMemo(() => {
    const map = new Map();
    windowed.forEach((e) => map.set(e.date, (map.get(e.date) || 0) + 1));
    return [...map.keys()].sort().map((iso) => ({ iso, date: parseISO(iso), count: map.get(iso) }));
  }, [windowed]);

  const [activeISO, setActiveISO] = useState(nights[0]?.iso);
  // Keep the active night valid when live data swaps in.
  useEffect(() => {
    if (nights.length && !nights.some((n) => n.iso === activeISO)) setActiveISO(nights[0].iso);
  }, [nights, activeISO]);

  const [interested, setInterested] = useState(() => new Set());
  const [detail, setDetail] = useState(null);
  const railRef = useRef(null);

  // Reset the carousel to the start whenever the active day changes.
  useEffect(() => {
    if (railRef.current) railRef.current.scrollTo({ left: 0, behavior: "auto" });
  }, [activeISO]);

  const visible = useMemo(
    () => windowed.filter((e) => e.date === activeISO),
    [windowed, activeISO]
  );

  function toggleInterest(id) {
    setInterested((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="nuit">
      <style>{CSS}</style>

      <header className="topbar">
        <div className="brand">
          <div className="logo">NUIT<span style={{ color: LIME }}>.</span> BXL</div>
          <a className="credit" href="https://instagram.com/bartuccino" target="_blank" rel="noreferrer">
            Made by @bartuccino
          </a>
        </div>
        <span className="saved-pill">♥ {interested.size}</span>
      </header>

      <nav className="daytabs" aria-label="Choose a night">
        {nights.map((n) => {
          const active = n.iso === activeISO;
          return (
            <button
              key={n.iso}
              className={`daytab ${active ? "is-active" : ""}`}
              onClick={() => setActiveISO(n.iso)}
              aria-pressed={active}
            >
              <span className="daytab__name">{DAYNAMES[n.date.getDay()]}</span>
              <span className="daytab__date">({ddmm(n.date)})</span>
            </button>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <div className="empty">
          <p>No upcoming parties in the next two weeks.</p>
        </div>
      ) : (
        <section className="rail" aria-label="Parties" ref={railRef}>
          {visible.map((e) => (
            <PartyCard
              key={e.id}
              event={e}
              saved={interested.has(e.id)}
              onToggle={() => toggleInterest(e.id)}
              onOpen={() => setDetail(e)}
            />
          ))}
        </section>
      )}

      <footer className="foot">
        <span>NUIT.BXL — prototype</span>
        <span>listings & flyers © their promoters / RA</span>
      </footer>

      {detail && (
        <EventDetail
          event={detail}
          saved={interested.has(detail.id)}
          onToggle={() => toggleInterest(detail.id)}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/* ---- Party card ------------------------------------------------------------ */
function PartyCard({ event, saved, onToggle, onOpen }) {
  const [imgOk, setImgOk] = useState(true);
  const extra = event.artists.length - 5;
  return (
    <article className="card">
      <button className="card__poster-btn" onClick={onOpen} aria-label={`Open ${event.title}`}>
        {event.image && imgOk ? (
          <div className="poster">
            <img className="poster__img" src={event.image} alt="" loading="lazy" onError={() => setImgOk(false)} />
          </div>
        ) : (
          <PosterArt event={event} />
        )}
        <span className={`tagbadge tagbadge--${event.tag.toLowerCase()}`}>{event.tag}</span>
      </button>

      <div className="card__body">
        <button className="card__title" onClick={onOpen}>{event.title}</button>

        <div className="card__venue">
          <Pin />
          <span>{event.venue.name} — {event.venue.address}</span>
        </div>

        <hr className="rule" />

        <div className="tags">
          {event.genres.slice(0, 3).map((g) => (<span className="tag" key={g}>{g}</span>))}
        </div>

        {event.artists.length > 0 ? (
          <div className="lineup">
            {event.artists.slice(0, 5).map((a) => (<span key={a}>{a}</span>))}
            {extra > 0 && <span className="lineup__more">+{extra} more</span>}
          </div>
        ) : (
          <div className="lineup lineup--tba">Line-up TBA</div>
        )}

        <div className="card__bottom">
          <hr className="rule" />
          <div className="price-row">
            <span>{event.cost || "Tickets on RA"}</span>
            <span className="price-row__time">{event.startTime}–{event.endTime}</span>
          </div>
          <div className="card__actions">
            <button className={`heart ${saved ? "is-on" : ""}`} onClick={onToggle} aria-pressed={saved}>
              {saved ? "♥ saved" : "♡ save"}
            </button>
            <button className="ticket" onClick={onOpen}>details</button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---- Detail overlay -------------------------------------------------------- */
function EventDetail({ event, saved, onToggle, onClose }) {
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const d = parseISO(event.date);
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={event.title}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="sheet__poster">
          {event.image && imgOk ? (
            <img className="sheet__img" src={fullFlyer(event.image)} alt="" onError={() => setImgOk(false)} />
          ) : (
            <PosterArt event={event} />
          )}
        </div>
        <div className="sheet__body">
          <h2 className="sheet__title">{event.title}</h2>
          <div className="card__venue sheet__venue"><Pin /><span>{event.venue.name} — {event.venue.address}</span></div>

          <div className="sheet__meta">
            <span>{DAYNAMES[d.getDay()]} {ddmm(d)}</span>
            <span>·</span>
            <span>{event.startTime}–{event.endTime}</span>
            {event.minAge && (<><span>·</span><span>{event.minAge}</span></>)}
            <span>·</span>
            <span className={`tagbadge tagbadge--${event.tag.toLowerCase()} tagbadge--inline`}>{event.tag}</span>
          </div>

          <div className="tags">{event.genres.map((g) => (<span className="tag" key={g}>{g}</span>))}</div>

          <h3 className="sheet__label">Line-up</h3>
          {event.artists.length > 0 ? (
            <div className="lineup lineup--full">{event.artists.map((a) => (<span key={a}>{a}</span>))}</div>
          ) : (
            <p className="sheet__note">Line-up to be announced.</p>
          )}

          <h3 className="sheet__label">Tickets</h3>
          <p className="sheet__price">{event.cost || "See RA for pricing"}</p>

          <div className="sheet__cta">
            <button className={`heart heart--lg ${saved ? "is-on" : ""}`} onClick={onToggle} aria-pressed={saved}>
              {saved ? "♥ saved" : "♡ save this night"}
            </button>
            <a className="ticket ticket--lg" href={event.contentUrl} target="_blank" rel="noreferrer">open on RA ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pin() {
  return (
    <svg viewBox="0 0 14 15" width="11" height="12" aria-hidden="true">
      <path d="M7 1.2C4.4 1.2 2.3 3.2 2.3 5.7c0 3 4 7.4 4.2 7.6.3.3.7.3 1 0 .2-.2 4.2-4.6 4.2-7.6C11.7 3.2 9.6 1.2 7 1.2zm0 6.3a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4z" fill="currentColor" />
    </svg>
  );
}

/* ============================================================================
   RESIDENT ADVISOR WIRING (reference — not executed here)
   ========================================================================== */
// eslint-disable-next-line no-unused-vars
const RA_GRAPHQL = `
query GET_EVENT_LISTINGS($filters: FilterInputDtoInput, $pageSize: Int, $page: Int) {
  eventListings(filters: $filters, pageSize: $pageSize, page: $page, sort: { listingDate: { order: ASCENDING } }) {
    data { event {
      id title date startTime endTime contentUrl flyerFront
      venue { name address contentUrl }
      artists { name }
      genres { name }
    } }
    totalResults
  }
}`;
// Brussels area id goes in variables.filters.areas.eq — read it off the graphql
// request body on ra.co/events/be/brussels (DevTools → Network).
//   variables: { filters: { areas: { eq: <BRUSSELS_AREA_ID> },
//     listingDate: { gte: "2026-06-21", lte: "2026-07-07" } }, pageSize: 50, page: 1 }

/* Flip LIVE = true and swap the mock array for this. Always queries today→+14d:

async function fetchEvents() {
  const today = new Date(); today.setHours(0,0,0,0);
  const from = today.toISOString().slice(0, 10);
  const to = new Date(today.getTime() + WINDOW_DAYS * 864e5).toISOString().slice(0, 10);
  const res = await fetch("/api/ra-proxy", {            // your proxy, NOT ra.co (CORS)
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to }),
  });
  const json = await res.json();
  return json.data.eventListings.data.map(({ event }) => ({
    id: event.id,
    title: event.title,
    venue: { name: event.venue.name, address: event.venue.address ?? "Brussels" },
    date: event.date.slice(0, 10),
    startTime: event.startTime?.slice(11, 16) ?? "",
    endTime: event.endTime?.slice(11, 16) ?? "",
    genres: event.genres.map((g) => g.name),
    artists: event.artists.map((a) => a.name),     // empty array if RA has none
    cost: "",                                        // RA listings don't expose price
    image: event.flyerFront,                         // already a usable CDN URL
    contentUrl: "https://ra.co" + event.contentUrl,
  }));
}
*/

// eslint-disable-next-line no-unused-vars
const RA_PROXY_EXAMPLE = `
// /api/ra-proxy  (Vercel / Netlify / Cloudflare Worker)
export default async function handler(req, res) {
  const { from, to } = req.body;
  const r = await fetch("https://ra.co/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "nuit-bxl" },
    body: JSON.stringify({
      operationName: "GET_EVENT_LISTINGS",
      query: RA_GRAPHQL,
      variables: { filters: { areas: { eq: BRUSSELS_AREA_ID },
        listingDate: { gte: from, lte: to } }, pageSize: 50, page: 1 },
    }),
  });
  res.status(200).json(await r.json());
}`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Syne+Mono&display=swap');

* { box-sizing: border-box; }
.nuit {
  --lime: ${LIME}; --bg: #111111; --grey: #717171; --greytab: #6e6e6e;
  background: var(--bg); color: #f2f0f0; min-height: 100%;
  font-family: 'Syne', system-ui, sans-serif; padding: 22px 0 0;
  max-width: 480px; margin: 0 auto; -webkit-font-smoothing: antialiased;
}
.topbar { display: flex; align-items: flex-start; justify-content: space-between; padding: 0 20px; }
.brand { display: flex; flex-direction: column; gap: 2px; }
.logo { font-weight: 800; font-size: 26px; letter-spacing: .5px; color: #fcfcfc; }
.credit { font-family: 'Syne Mono', monospace; font-size: 10px; letter-spacing: .3px; color: var(--grey); text-decoration: none; transition: color .15s ease; }
.credit:hover { color: var(--lime); }
.credit:focus-visible { outline: 2px solid var(--lime); outline-offset: 2px; border-radius: 3px; }
.saved-pill { font-family: 'Syne Mono', monospace; font-size: 12px; color: #111; background: var(--lime); border-radius: 999px; padding: 6px 12px; letter-spacing: .5px; }

.daytabs { display: flex; gap: 22px; overflow-x: auto; padding: 22px 20px 14px; scrollbar-width: none; }
.daytabs::-webkit-scrollbar { display: none; }
.daytab { position: relative; background: none; border: none; cursor: pointer; white-space: nowrap; display: flex; align-items: baseline; gap: 6px; padding: 2px 0; color: var(--greytab); font-family: 'Syne', sans-serif; transition: color .15s ease; }
.daytab__name { font-weight: 800; font-size: 20px; letter-spacing: .3px; }
.daytab__date { font-weight: 700; font-size: 13px; opacity: .8; }
.daytab.is-active { color: #f2f0f0; }
.daytab.is-past { opacity: .4; }
.daytab.is-past.is-active { opacity: .7; }
.daytab.is-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px; background: var(--lime); }
.daytab:focus-visible { outline: 2px solid var(--lime); outline-offset: 4px; border-radius: 4px; }


.rail { display: flex; gap: 14px; overflow-x: auto; padding: 4px 20px 26px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.rail::-webkit-scrollbar { display: none; }

.card { flex: 0 0 320px; scroll-snap-align: start; background: #fff; color: #1b1b1b; border-radius: 8px; padding: 18px 14px 12px; display: flex; flex-direction: column; }
.card__poster-btn { border: none; padding: 0; background: none; cursor: pointer; display: block; width: 100%; position: relative; }
.poster { width: 100%; aspect-ratio: 314 / 190; border-radius: 2px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: #eee; }
.poster__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.poster__title { position: relative; display: flex; flex-wrap: wrap; gap: 2px 8px; justify-content: center; padding: 14px; font-family: 'Syne', sans-serif; font-weight: 800; line-height: .92; font-size: 22px; color: #fff; text-shadow: 2px 2px 0 rgba(0,0,0,.35); text-transform: uppercase; }
.tagbadge { position: absolute; top: 8px; left: 8px; font-family: 'Syne Mono', monospace; font-size: 10px; letter-spacing: .6px; padding: 4px 9px; border-radius: 999px; text-transform: uppercase; }
.tagbadge--festival { background: var(--lime); color: #111; }
.tagbadge--clubbing { background: rgba(17,17,17,.78); color: var(--lime); border: 1px solid var(--lime); }
.tagbadge--inline { position: static; padding: 2px 8px; }

.card__body { display: flex; flex-direction: column; flex: 1; padding-top: 16px; }
.card__title { text-align: left; border: none; background: none; padding: 0; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 21px; line-height: 1.02; color: #1b1b1b; text-transform: uppercase; letter-spacing: -.2px; }
.card__title:hover { color: #000; }
.card__venue { display: flex; align-items: center; gap: 6px; margin-top: 8px; color: var(--grey); font-family: system-ui, sans-serif; font-size: 12px; font-weight: 600; }
.card__venue svg { flex: 0 0 auto; }
.card__venue span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rule { border: none; border-top: 1px solid #e7e7e7; margin: 12px 0; width: 100%; }
.tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { font-family: 'Syne Mono', monospace; font-size: 11px; letter-spacing: .4px; color: #fff; background: #1b1b1b; border: 2px solid #1b1b1b; border-radius: 8px; padding: 3px 9px; text-transform: uppercase; }
.lineup { display: flex; flex-direction: column; gap: 2px; margin-top: 16px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #1b1b1b; }
.lineup__more { color: var(--grey); font-weight: 600; font-size: 13px; }
.lineup--tba { color: var(--grey); font-style: italic; font-weight: 600; }
.lineup--full { flex-flow: row wrap; gap: 6px 14px; }

.card__bottom { margin-top: auto; }
.price-row { display: flex; justify-content: space-between; gap: 14px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #1b1b1b; }
.price-row__time { color: var(--grey); font-weight: 600; }
.card__actions { display: flex; gap: 8px; margin-top: 12px; }
.heart, .ticket { font-family: 'Syne Mono', monospace; font-size: 11px; letter-spacing: .3px; cursor: pointer; border-radius: 7px; padding: 7px 10px; border: 1.5px solid #1b1b1b; transition: all .15s ease; }
.heart { background: #fff; color: #1b1b1b; }
.heart.is-on { background: #1b1b1b; color: var(--lime); }
.heart:hover { background: #1b1b1b; color: #fff; }
.heart.is-on:hover { color: var(--lime); }
.ticket { background: #1b1b1b; color: #fff; border-color: #1b1b1b; flex: 1; text-align: center; text-decoration: none; }
.ticket:hover { background: #000; }
.heart:focus-visible, .ticket:focus-visible, .card__title:focus-visible, .card__poster-btn:focus-visible { outline: 2px solid var(--lime); outline-offset: 2px; }

.empty { padding: 30px 20px 60px; text-align: center; color: var(--grey); font-family: 'Syne Mono', monospace; font-size: 13px; }
.empty button { margin-top: 12px; background: var(--lime); color: #111; border: none; border-radius: 7px; padding: 8px 14px; font-family: 'Syne Mono', monospace; cursor: pointer; }
.foot { display: flex; justify-content: space-between; gap: 12px; padding: 18px 20px 28px; border-top: 1px solid #1e1e1e; font-family: 'Syne Mono', monospace; font-size: 10px; color: #555; letter-spacing: .3px; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); backdrop-filter: blur(3px); display: flex; align-items: flex-end; justify-content: center; z-index: 50; animation: fade .2s ease; }
.sheet { background: #fff; color: #1b1b1b; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; border-radius: 18px 18px 0 0; position: relative; animation: rise .26s cubic-bezier(.2,.8,.2,1); }
.sheet__close { position: absolute; top: 12px; right: 12px; z-index: 2; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,.5); color: #fff; font-size: 14px; cursor: pointer; }
.sheet__poster { background: #111; display: flex; justify-content: center; }
.sheet__img { width: 100%; max-height: 52vh; object-fit: contain; border-radius: 18px 18px 0 0; display: block; }
.sheet__poster .poster { border-radius: 18px 18px 0 0; aspect-ratio: 16 / 10; }
.sheet__body { padding: 18px 20px 28px; }
.sheet__title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; text-transform: uppercase; margin: 4px 0 0; line-height: 1.02; }
.sheet__venue { margin-top: 10px; }
.sheet__meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 14px; font-family: 'Syne Mono', monospace; font-size: 12px; color: var(--grey); }
.sheet__label { font-family: 'Syne Mono', monospace; font-size: 11px; letter-spacing: .6px; color: var(--grey); margin: 20px 0 8px; text-transform: uppercase; }
.sheet__price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin: 0; }
.sheet__note { font-family: system-ui, sans-serif; font-size: 13px; color: var(--grey); margin: 0; }
.sheet__cta { display: flex; gap: 10px; margin-top: 22px; }
.heart--lg, .ticket--lg { font-size: 13px; padding: 12px 14px; flex: 1; text-align: center; }

@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rise { from { transform: translateY(40px); opacity: .6; } to { transform: translateY(0); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .overlay, .sheet { animation: none; } * { transition: none !important; } }
`;
