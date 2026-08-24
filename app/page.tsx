"use client";

import { useMemo, useState } from "react";
import type { HomeLocation, RecommendedCollege } from "@/lib/types";

type Tab = "Discover" | "Majors" | "Medical Pathways" | "Advisor" | "My List";

const money = (n?: number | null) => n == null ? "—" : `$${Math.round(n).toLocaleString()}`;
const pct = (n?: number | null) => n == null ? "—" : `${Math.round(n * 100)}%`;
const number = (n?: number | null) => n == null ? "—" : Math.round(n).toLocaleString();
const badgeClass = (category: string) => `badge badge-${category.toLowerCase().replaceAll(" ", "-")}`;

const majorMatches = [
  { major: "Biomedical Engineering", score: 92, premed: "Strong", backup: "Excellent", why: "Healthcare + quantitative problem-solving + engineering career flexibility." },
  { major: "Neuroscience", score: 89, premed: "Excellent", backup: "Moderate", why: "Strong fit for biology, research, behavior and medicine." },
  { major: "Data Science", score: 84, premed: "Possible", backup: "Excellent", why: "Strong employability and analytical fit; medical prerequisites must be planned separately." },
  { major: "Biochemistry", score: 82, premed: "Excellent", backup: "Moderate", why: "Direct alignment with chemistry, biology and many medical-school prerequisites." }
];

const medicalPrograms = [
  { program: "Special Program in Medicine", school: "University of Connecticut", type: "BS/MD", status: "Verify current cycle" },
  { program: "PLME", school: "Brown University", type: "BA/MD", status: "Verify current cycle" },
  { program: "Accelerated Medical Program", school: "NJIT / NJMS", type: "BS/MD", status: "Verify current cycle" },
  { program: "Early Acceptance / Affiliate Pathways", school: "LECOM partner schools", type: "BS/DO", status: "Verify affiliate" }
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("Discover");
  const [sat, setSat] = useState(1450);
  const [gpa, setGpa] = useState(4.1);
  const [budget, setBudget] = useState(55000);
  const [radius, setRadius] = useState(200);
  const [career, setCareer] = useState("Pre-Med / Healthcare");
  const [locationText, setLocationText] = useState("South Windsor, CT");
  const [home, setHome] = useState<HomeLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [colleges, setColleges] = useState<RecommendedCollege[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [question, setQuestion] = useState("Which of these colleges gives me strong pre-med options with a practical backup major?");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const counts = useMemo(() => ({
    likely: colleges.filter(c => c.category === "Likely").length,
    target: colleges.filter(c => c.category === "Target").length,
    reach: colleges.filter(c => c.category === "Reach").length,
    high: colleges.filter(c => c.category === "High Reach").length
  }), [colleges]);

  async function resolveLocation(q = locationText) {
    setLocationLoading(true); setMessage("");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Location lookup failed.");
      setHome(data);
      setLocationText(`${data.zip} — ${data.label.split(",").slice(0, 3).join(",")}`);
      return data as HomeLocation;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Location lookup failed.");
      return null;
    } finally { setLocationLoading(false); }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) { setMessage("Browser location is not available. Enter your ZIP or city/state instead."); return; }
    setLocationLoading(true); setMessage("");
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not resolve current location.");
        setHome(data);
        setLocationText(`${data.zip} — Current location`);
      } catch (e) { setMessage(e instanceof Error ? e.message : "Could not resolve current location."); }
      finally { setLocationLoading(false); }
    }, () => { setLocationLoading(false); setMessage("Location permission was not granted. Enter your ZIP or city/state instead."); }, { enableHighAccuracy: false, timeout: 10000 });
  }

  async function buildList() {
    setRecommendLoading(true); setMessage(""); setNote("");
    try {
      const resolved = home ?? await resolveLocation();
      if (!resolved) return;
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sat, gpa, budget, radius, career, zip: resolved.zip, homeLat: resolved.lat, homeLon: resolved.lon })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recommendation request failed.");
      setColleges(data.colleges || []);
      setNote(data.note || "");
      setTab("Discover");
      if (!(data.colleges || []).length) setMessage("No colleges matched these settings. Try a wider radius or broader career area.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Recommendation request failed."); }
    finally { setRecommendLoading(false); }
  }

  async function askAdvisor() {
    setAsking(true); setAnswer("");
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, profile: { sat, gpa, budget, radius, career, home }, colleges })
      });
      const data = await res.json();
      setAnswer(data.answer || data.error || "AI advisor is not configured yet.");
    } catch { setAnswer("Advisor could not connect."); }
    finally { setAsking(false); }
  }

  function toggleSave(name: string) {
    setSaved(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  }

  return <main>
    <header className="topbar">
      <div className="brand"><div className="mark">MP</div><div><strong>My College Admission Path</strong><span>Find fit. Build your path.</span></div></div>
      <nav>{(["Discover", "Majors", "Medical Pathways", "Advisor", "My List"] as Tab[]).map(x => <button key={x} className={tab === x ? "active" : ""} onClick={() => setTab(x)}>{x}</button>)}</nav>
      <div className="creator">S.A.</div>
    </header>

    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">PERSONALIZED COLLEGE PLANNING</span><h1>Find colleges that fit your numbers—and your path.</h1><p>Use your home location, SAT, GPA, budget, career direction and preferred radius to create a ranked college list.</p><div className="trust"><span>✓ Live federal college data</span><span>✓ Transparent heuristic fit score</span><span>✓ No admission guarantees</span></div></div>
      <div className="profile-card">
        <div className="card-title"><b>Student profile</b><span>Recommendation inputs</span></div>
        <label>Home location <div className="location-line"><input value={locationText} onChange={e => { setLocationText(e.target.value); setHome(null); }} placeholder="ZIP or city, state"/><button type="button" onClick={() => resolveLocation()} disabled={locationLoading}>{locationLoading ? "…" : "Set"}</button></div></label>
        <button className="location-button" type="button" onClick={useCurrentLocation}>⌖ Use current location</button>
        {home && <div className="location-ok">Using ZIP {home.zip} as the radius center.</div>}
        <div className="grid2"><label>SAT<input type="number" min="400" max="1600" value={sat} onChange={e => setSat(+e.target.value)}/></label><label>GPA<input type="number" min="0" max="5" step="0.1" value={gpa} onChange={e => setGpa(+e.target.value)}/></label><label>Radius<select value={radius} onChange={e => setRadius(+e.target.value)}>{[50,100,150,200,300,500].map(x => <option value={x} key={x}>{x} miles</option>)}</select></label><label>Annual budget<input type="number" min="0" value={budget} onChange={e => setBudget(+e.target.value)}/></label></div>
        <label>Broad area<select value={career} onChange={e => setCareer(e.target.value)}><option>Pre-Med / Healthcare</option><option>Business / Finance</option><option>Engineering</option><option>Computer Science / AI</option><option>Nursing</option><option>Undecided</option></select></label>
        <button className="primary" onClick={buildList} disabled={recommendLoading}>{recommendLoading ? "Building your list…" : "Build My College List →"}</button>
        {message && <div className="message">{message}</div>}
      </div>
    </section>

    <section className="workspace">
      {tab === "Discover" && <>
        <div className="section-head"><div><span className="kicker">COLLEGE DISCOVERY</span><h2>{colleges.length ? `Top ${colleges.length} recommended colleges` : "Build your personalized college list"}</h2><p>{colleges.length ? `Ranked for ${career}, ${radius} miles from ${home?.zip || "your home"}, SAT ${sat}, GPA ${gpa}, and budget ${money(budget)}.` : "Enter your profile above and click Build My College List. The app will return up to 20 ranked colleges."}</p></div></div>
        {colleges.length > 0 && <>
          <div className="summary"><div><b>{counts.likely}</b><span>Likely</span></div><div><b>{counts.target}</b><span>Target</span></div><div><b>{counts.reach}</b><span>Reach</span></div><div><b>{counts.high}</b><span>High Reach</span></div></div>
          {note && <div className="data-note">{note}</div>}
          <div className="table-wrap"><table><thead><tr><th>#</th><th>College</th><th>Fit</th><th>Admission</th><th>Distance</th><th>Avg SAT</th><th>Acceptance</th><th>Avg net price</th><th>Graduation</th><th>Enrollment</th><th></th></tr></thead><tbody>{colleges.map((c, i) => <tr key={c.id || c.name}><td className="rank">{i + 1}</td><td><b>{c.name}</b><small>{c.city}, {c.state}</small></td><td><strong className="fit">{c.fitScore}</strong></td><td><span className={badgeClass(c.category)}>{c.category}</span></td><td>{c.distanceMiles == null ? "—" : `${c.distanceMiles} mi`}</td><td>{number(c.satAverage)}</td><td>{pct(c.acceptanceRate)}</td><td>{money(c.netPrice)}</td><td>{pct(c.graduationRate)}</td><td>{number(c.enrollment)}</td><td><button className="star" onClick={() => toggleSave(c.name)}>{saved.includes(c.name) ? "★" : "☆"}</button></td></tr>)}</tbody></table></div>
          <p className="method">Fit score combines admissions profile, affordability, graduation outcomes, distance and broad-area program filtering. It is an advisory planning score—not an admission probability.</p>
        </>}
      </>}

      {tab === "Majors" && <><div className="section-head"><div><span className="kicker">MAJOR FINDER</span><h2>Choose a major that fits both interests and future options.</h2><p>Pre-med is a pathway, not a required major. These examples show how the major recommender can balance medical-school preparation with backup-career resilience.</p></div></div><div className="major-grid">{majorMatches.map((m,i) => <article key={m.major}><div className="number">0{i+1}</div><div><h3>{m.major}</h3><p>{m.why}</p><span>Pre-med: {m.premed}</span><span>Backup career: {m.backup}</span></div><b>{m.score}</b></article>)}</div></>}

      {tab === "Medical Pathways" && <><div className="section-head"><div><span className="kicker">MEDICAL PATHWAYS</span><h2>Traditional pre-med, BS/MD, BS/DO and early assurance.</h2><p>Combined medical programs change frequently. This section intentionally labels program information for current-cycle verification.</p></div></div><div className="path-table">{medicalPrograms.map(p => <div key={p.program}><b>{p.program}</b><span>{p.school}</span><span>{p.type}</span><em>{p.status}</em></div>)}</div></>}

      {tab === "Advisor" && <div className="advisor"><div><span className="kicker">AI ADVISOR</span><h2>Ask about your list.</h2><p>The advisor can explain tradeoffs using the current student profile and ranked college list.</p></div><div className="chat"><textarea value={question} onChange={e => setQuestion(e.target.value)}/><button className="primary" onClick={askAdvisor} disabled={asking}>{asking ? "Thinking…" : "Ask Advisor →"}</button>{answer && <div className="answer">{answer}</div>}</div></div>}

      {tab === "My List" && <><div className="section-head"><div><span className="kicker">MY LIST</span><h2>{saved.length} saved college{saved.length === 1 ? "" : "s"}</h2><p>Persistent account-based saving can be connected to the prepared Supabase database.</p></div></div><div className="saved">{saved.length ? saved.map(name => <div key={name}><b>{name}</b><select defaultValue="Researching"><option>Researching</option><option>Visit Planned</option><option>Visited</option><option>Applying</option><option>Submitted</option><option>Accepted</option><option>Waitlisted</option><option>Denied</option></select><button onClick={() => toggleSave(name)}>Remove</button></div>) : <p>Save a college from the recommendation table to add it here.</p>}</div></>}
    </section>

    <footer><div><b>My College Admission Path</b><span>Transparent data + guided planning.</span></div><span>Data sources · Methodology · Privacy</span><small>Created by S. Ambooken</small></footer>
  </main>;
}
