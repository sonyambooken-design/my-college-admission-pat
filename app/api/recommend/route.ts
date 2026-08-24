import { NextRequest, NextResponse } from "next/server";
import { scoreSchool } from "@/lib/scoring";

const BASE = "https://api.data.gov/ed/collegescorecard/v1/schools.json";
const FIELDS = [
  "id","school.name","school.city","school.state","school.ownership","location.lat","location.lon",
  "latest.student.size","latest.admissions.admission_rate.overall","latest.admissions.sat_scores.average.overall",
  "latest.cost.tuition.in_state","latest.cost.tuition.out_of_state","latest.cost.avg_net_price.overall",
  "latest.completion.completion_rate_4yr_150nt"
].join(",");

const CIP: Record<string, string | null> = {
  "Pre-Med / Healthcare": "26.01",
  "Business / Finance": "52.01",
  "Engineering": "14.01",
  "Computer Science / AI": "11.07",
  "Nursing": "51.38",
  "Undecided": null
};

async function fetchSchools(params: { key: string; zip: string; radius: number; cip?: string | null }) {
  const all: any[] = [];
  let total = 0;
  const maxPages = 4; // Up to 400 candidates before ranking the best 20.

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(BASE);
    url.searchParams.set("api_key", params.key);
    url.searchParams.set("zip", params.zip);
    url.searchParams.set("distance", `${params.radius}mi`);
    url.searchParams.set("school.degrees_awarded.predominant", "3");
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    if (params.cip) url.searchParams.set("latest.programs.cip_4_digit.code", params.cip);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.errors?.[0]?.message || body?.message || `College Scorecard returned ${res.status}`);
    const rows = Array.isArray(body.results) ? body.results : [];
    total = body.metadata?.total ?? rows.length;
    all.push(...rows);
    if (rows.length < 100 || all.length >= total) break;
  }

  return { results: all, metadata: { total } };
}

export async function POST(req: NextRequest) {
  const key = process.env.COLLEGE_SCORECARD_API_KEY;
  if (!key) return NextResponse.json({ error: "College Scorecard API key is not configured in Vercel." }, { status: 503 });

  const body = await req.json();
  const sat = Number(body.sat);
  const gpa = Number(body.gpa);
  const budget = Number(body.budget);
  const radius = Number(body.radius);
  const zip = String(body.zip || "");
  const homeLat = Number(body.homeLat);
  const homeLon = Number(body.homeLon);
  const career = String(body.career || "Undecided");
  if (!zip || !Number.isFinite(homeLat) || !Number.isFinite(homeLon)) {
    return NextResponse.json({ error: "Choose a valid home location first." }, { status: 400 });
  }

  try {
    const cip = CIP[career] ?? null;
    let payload = await fetchSchools({ key, zip, radius, cip });
    let careerFiltered = Boolean(cip);
    let relaxedCareerFilter = false;

    // If a narrow CIP code returns too few schools, broaden the pool rather than showing an empty list.
    if (careerFiltered && (!Array.isArray(payload.results) || payload.results.length < 20)) {
      const broad = await fetchSchools({ key, zip, radius, cip: null });
      if (Array.isArray(broad.results) && broad.results.length > (payload.results?.length ?? 0)) {
        payload = broad;
        careerFiltered = false;
        relaxedCareerFilter = true;
      }
    }

    const colleges = (payload.results || [])
      .map((raw: any) => scoreSchool(raw, { sat, gpa, budget, radius, homeLat, homeLon, careerFiltered }))
      .filter(Boolean)
      .sort((a: any, b: any) => b.fitScore - a.fitScore)
      .slice(0, 20);

    return NextResponse.json({
      colleges,
      totalCandidates: payload.metadata?.total ?? payload.results?.length ?? colleges.length,
      careerFiltered,
      relaxedCareerFilter,
      note: relaxedCareerFilter
        ? "The career-program filter was broadened because too few colleges were returned. Use the career score as a planning signal and verify the specific major on the college website."
        : careerFiltered
          ? "These schools were queried using a College Scorecard program-code filter for the selected broad area."
          : "Career fit is advisory; verify specific majors and program availability with each college."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recommendation request failed." }, { status: 502 });
  }
}
