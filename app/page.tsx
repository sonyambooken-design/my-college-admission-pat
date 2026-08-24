"use client";

import { useMemo, useState } from "react";
import type { HomeLocation, RecommendedCollege } from "@/lib/types";
import { defaultDiscoveryProfile, recommendMajors, recommendCareers, nextStepsForMajor, AP_OPTIONS, ACTIVITY_OPTIONS, LEADERSHIP_OPTIONS, SPORTS_OPTIONS, SERVICE_OPTIONS, WORK_OPTIONS, PRIORITY_OPTIONS, type DiscoveryProfile, type RatingKey } from "@/lib/majorDiscovery";

type Tab = "Discover" | "Discover My Major" | "Medical Pathways" | "Advisor" | "My List";

const money = (n?: number | null) => n == null ? "—" : `$${Math.round(n).toLocaleString()}`;
const pct = (n?: number | null) => n == null ? "—" : `${Math.round(n * 100)}%`;
const number = (n?: number | null) => n == null ? "—" : Math.round(n).toLocaleString();
const badgeClass = (category: string) => `badge badge-${category.toLowerCase().replaceAll(" ", "-")}`;

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
  const [discovery, setDiscovery] = useState<DiscoveryProfile>(defaultDiscoveryProfile);
  const [majorResults, setMajorResults] = useState<ReturnType<typeof recommendMajors>>([]);
  const [careerResults, setCareerResults] = useState<ReturnType<typeof recommendCareers>>([]);
  const [discoveryComplete, setDiscoveryComplete] = useState(false);

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

  function rate(key: RatingKey, value: number) { setDiscovery(prev => ({...prev, [key]: value})); }
  function toggleArray(key: keyof Pick<DiscoveryProfile, "apCourses"|"activities"|"leadershipRoles"|"sports"|"service"|"work"|"priorities">, value: string) {
    setDiscovery(prev => { const arr=prev[key] as string[]; return {...prev, [key]: arr.includes(value) ? arr.filter(x=>x!==value) : [...arr,value]}; });
  }
  function runMajorDiscovery() {
    setMajorResults(recommendMajors(discovery).slice(0,5));
    setCareerResults(recommendCareers(discovery));
    setDiscoveryComplete(true);
    setTab("Discover My Major");
    setTimeout(()=>document.getElementById("major-results")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }

  const ratingQuestions: {key:RatingKey;label:string}[] = [
    {key:"biology",label:"I enjoy biology and life sciences."},{key:"chemistry",label:"I enjoy chemistry and laboratory science."},{key:"math",label:"I enjoy math and quantitative problem solving."},{key:"coding",label:"I enjoy coding, computers and technology."},{key:"business",label:"I am interested in business, markets or entrepreneurship."},{key:"writing",label:"I enjoy writing, reading and communication."},{key:"design",label:"I enjoy design and visual/spatial thinking."},{key:"healthcare",label:"I am strongly interested in healthcare or medicine."},{key:"research",label:"I enjoy research, experiments and discovering new knowledge."},{key:"helping",label:"I want my work to directly help people."},{key:"leadership",label:"I enjoy leading groups and organizing projects."},{key:"persuasion",label:"I enjoy persuading, negotiating or selling ideas."},{key:"data",label:"I enjoy analyzing data, trends and evidence."},{key:"building",label:"I like building, fixing or creating things."},{key:"creativity",label:"I enjoy creative, open-ended problems."},{key:"publicSpeaking",label:"I am comfortable speaking in front of groups."},{key:"teamwork",label:"I enjoy working as part of a team."},{key:"independence",label:"I enjoy working independently on difficult problems."}
  ];

  return <main>
    <header className="topbar">
      <div className="brand"><div className="mark">MP</div><div><strong>My College Admission Path</strong><span>Find fit. Build your path.</span></div></div>
      <nav>{(["Discover", "Discover My Major", "Medical Pathways", "Advisor", "My List"] as Tab[]).map(x => <button key={x} className={tab === x ? "active" : ""} onClick={() => setTab(x)}>{x}</button>)}</nav>
      <div className="creator">S.A.</div>
    </header>

    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">PERSONALIZED COLLEGE PLANNING</span><h1>Find colleges that fit your numbers—and your path.</h1><p>Use your home location, SAT, GPA, budget, career direction and preferred radius to create a ranked college list—or take the student discovery questionnaire to explore majors and careers.</p><div className="trust"><span>✓ Live federal college data</span><span>✓ Transparent heuristic fit score</span><span>✓ No admission guarantees</span></div></div>
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

      {tab === "Discover My Major" && <>
        <div className="section-head"><div><span className="kicker">STUDENT DISCOVERY</span><h2>Discover My Major & Career Path</h2><p>Tell us what you enjoy, what you have actually done, and what matters for your future. The recommendation engine uses interests together with AP/Honors courses, clubs, leadership, sports, service and work experience.</p></div></div>
        <div className="discovery-shell">
          <section className="question-card"><h3>1. Interests & work style</h3><p className="muted">Rate each statement from 1 (not like me) to 5 (very much like me).</p><div className="rating-list">{ratingQuestions.map(q=><div className="rating-row" key={q.key}><span>{q.label}</span><div className="rating-buttons">{[1,2,3,4,5].map(v=><button key={v} className={discovery[q.key]===v?"chosen":""} onClick={()=>rate(q.key,v)}>{v}</button>)}</div></div>)}</div></section>
          <section className="question-card"><h3>2. Academic evidence</h3><p className="muted">Select AP, IB or advanced courses taken or planned.</p><div className="choice-grid">{AP_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("apCourses",x)} className={discovery.apCourses.includes(x)?"choice on":"choice"}>{x}</button>)}</div></section>
          <section className="question-card"><h3>3. Clubs & extracurriculars</h3><div className="choice-grid">{ACTIVITY_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("activities",x)} className={discovery.activities.includes(x)?"choice on":"choice"}>{x}</button>)}</div></section>
          <section className="question-card"><h3>4. Leadership roles</h3><p className="muted">Leadership is most useful when it reflects real responsibility—not merely a title.</p><div className="choice-grid">{LEADERSHIP_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("leadershipRoles",x)} className={discovery.leadershipRoles.includes(x)?"choice on":"choice"}>{x}</button>)}</div></section>
          <section className="question-card"><h3>5. Sports</h3><div className="choice-grid">{SPORTS_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("sports",x)} className={discovery.sports.includes(x)?"choice on":"choice"}>{x}</button>)}</div></section>
          <section className="question-card"><h3>6. Community service</h3><div className="choice-grid">{SERVICE_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("service",x)} className={discovery.service.includes(x)?"choice on":"choice"}>{x}</button>)}</div></section>
          <section className="question-card"><h3>7. Work, internships & projects</h3><div className="choice-grid">{WORK_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("work",x)} className={discovery.work.includes(x)?"choice on":"choice"}>{x}</button>)}</div></section>
          <section className="question-card"><h3>8. Career priorities</h3><div className="choice-grid">{PRIORITY_OPTIONS.map(x=><button key={x} onClick={()=>toggleArray("priorities",x)} className={discovery.priorities.includes(x)?"choice on":"choice"}>{x}</button>)}</div><label className="education-label">How much education are you open to?<select value={discovery.educationYears} onChange={e=>setDiscovery(prev=>({...prev,educationYears:e.target.value as DiscoveryProfile["educationYears"]}))}><option value="4">About 4 years</option><option value="6">Up to 6 years</option><option value="8+">8+ years / professional school</option><option value="unsure">Not sure yet</option></select></label></section>
          <button className="primary discovery-submit" onClick={runMajorDiscovery}>Recommend My Majors & Careers →</button>
        </div>
        {discoveryComplete && <div id="major-results" className="discovery-results"><div className="section-head"><div><span className="kicker">YOUR RESULTS</span><h2>Top 5 majors to explore</h2><p>These are exploration recommendations, not a declaration of aptitude or a requirement to choose one now.</p></div></div><div className="major-grid">{majorResults.map((m,i)=>{const next=nextStepsForMajor(m.major);return <article key={m.major} className="major-result-card"><div className="number">0{i+1}</div><div><h3>{m.major}</h3><p>{m.why}</p><div className="result-tags"><span>Backup career: {m.backup}</span><span>Education: {m.education}</span></div><details><summary>Courses & activities to explore next</summary><b>Courses:</b> {next.courses.join(", ") || "Explore relevant advanced coursework"}<br/><b>Activities:</b> {next.activities.join(", ") || "Explore a related club, project or internship"}</details></div><b className="big-score">{m.score}</b></article>})}</div><div className="career-panel"><h2>Top 5 career paths to investigate</h2><div className="career-grid">{careerResults.map((c,i)=><article key={c.career}><span>0{i+1}</span><div><h3>{c.career}</h3><p>Strongly connected to your {c.source} profile match. Use this as a prompt for job shadowing, research and informational interviews.</p></div><b>{c.score}</b></article>)}</div></div><div className="discovery-caution"><b>How to use these results:</b> Look for patterns, not a single “correct” answer. Course rigor, grades, actual experiences, values and evolving interests should all influence the final major choice. For pre-med students, medical-school prerequisites are separate from the undergraduate major.</div></div>}
      </>}


      {tab === "Medical Pathways" && <><div className="section-head"><div><span className="kicker">MEDICAL PATHWAYS</span><h2>Traditional pre-med, BS/MD, BS/DO and early assurance.</h2><p>Combined medical programs change frequently. This section intentionally labels program information for current-cycle verification.</p></div></div><div className="path-table">{medicalPrograms.map(p => <div key={p.program}><b>{p.program}</b><span>{p.school}</span><span>{p.type}</span><em>{p.status}</em></div>)}</div></>}

      {tab === "Advisor" && <div className="advisor"><div><span className="kicker">AI ADVISOR</span><h2>Ask about your list.</h2><p>The advisor can explain tradeoffs using the current student profile and ranked college list.</p></div><div className="chat"><textarea value={question} onChange={e => setQuestion(e.target.value)}/><button className="primary" onClick={askAdvisor} disabled={asking}>{asking ? "Thinking…" : "Ask Advisor →"}</button>{answer && <div className="answer">{answer}</div>}</div></div>}

      {tab === "My List" && <><div className="section-head"><div><span className="kicker">MY LIST</span><h2>{saved.length} saved college{saved.length === 1 ? "" : "s"}</h2><p>Persistent account-based saving can be connected to the prepared Supabase database.</p></div></div><div className="saved">{saved.length ? saved.map(name => <div key={name}><b>{name}</b><select defaultValue="Researching"><option>Researching</option><option>Visit Planned</option><option>Visited</option><option>Applying</option><option>Submitted</option><option>Accepted</option><option>Waitlisted</option><option>Denied</option></select><button onClick={() => toggleSave(name)}>Remove</button></div>) : <p>Save a college from the recommendation table to add it here.</p>}</div></>}
    </section>

    <footer><div><b>My College Admission Path</b><span>Transparent data + guided planning.</span></div><span>Data sources · Methodology · Privacy</span><small>Created by S. Ambooken</small></footer>
  </main>;
}
