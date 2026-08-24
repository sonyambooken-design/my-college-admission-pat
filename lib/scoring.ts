import type { AdmissionCategory, RecommendedCollege } from "./types";

type RawSchool = {
  id?: number;
  "school.name"?: string;
  "school.city"?: string;
  "school.state"?: string;
  "school.ownership"?: number;
  "location.lat"?: number;
  "location.lon"?: number;
  "latest.student.size"?: number;
  "latest.admissions.admission_rate.overall"?: number;
  "latest.admissions.sat_scores.average.overall"?: number;
  "latest.cost.tuition.in_state"?: number;
  "latest.cost.tuition.out_of_state"?: number;
  "latest.cost.avg_net_price.overall"?: number;
  "latest.completion.completion_rate_4yr_150nt"?: number;
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function admissionsScore(studentSat: number, gpa: number, satAverage?: number | null, acceptanceRate?: number | null) {
  let satScore = 62;
  if (satAverage) {
    const diff = studentSat - satAverage;
    satScore = clamp(65 + diff * 0.22);
  }

  // GPA is deliberately a light heuristic because schools report weighted/unweighted GPA differently.
  const normalizedGpa = clamp((gpa / 4.5) * 100);
  const selectivityAdjustment = acceptanceRate == null ? 0 : acceptanceRate < 0.12 ? -22 : acceptanceRate < 0.25 ? -12 : acceptanceRate > 0.65 ? 8 : 0;
  return Math.round(clamp(satScore * 0.72 + normalizedGpa * 0.28 + selectivityAdjustment));
}

function admissionCategory(studentSat: number, satAverage?: number | null, acceptanceRate?: number | null): AdmissionCategory {
  const rate = acceptanceRate ?? 0.5;
  const diff = satAverage ? studentSat - satAverage : 0;
  if (rate < 0.12) return "High Reach";
  if (rate < 0.25 || diff < -70) return "Reach";
  if (rate >= 0.55 && diff >= 80) return "Likely";
  if (rate >= 0.70 && diff >= 20) return "Likely";
  return "Target";
}

function financialScore(budget: number, netPrice?: number | null) {
  if (!netPrice || budget <= 0) return 65;
  if (netPrice <= budget) return Math.round(clamp(88 + ((budget - netPrice) / Math.max(budget, 1)) * 20));
  return Math.round(clamp(88 - ((netPrice - budget) / Math.max(budget, 1)) * 120));
}

function outcomesScore(graduationRate?: number | null) {
  if (graduationRate == null) return 62;
  return Math.round(clamp(graduationRate * 100));
}

function locationScore(distance: number, radius: number) {
  if (radius <= 0) return 50;
  return Math.round(clamp(100 - (distance / radius) * 45, 50, 100));
}

export function scoreSchool(
  raw: RawSchool,
  profile: { sat: number; gpa: number; budget: number; radius: number; homeLat: number; homeLon: number; careerFiltered: boolean }
): RecommendedCollege | null {
  const lat = raw["location.lat"];
  const lon = raw["location.lon"];
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  const distanceMiles = haversineMiles(profile.homeLat, profile.homeLon, lat, lon);
  if (distanceMiles > profile.radius * 1.03) return null;

  const satAverage = raw["latest.admissions.sat_scores.average.overall"] ?? null;
  const acceptanceRate = raw["latest.admissions.admission_rate.overall"] ?? null;
  const netPrice = raw["latest.cost.avg_net_price.overall"] ?? null;
  const grad = raw["latest.completion.completion_rate_4yr_150nt"] ?? null;

  const a = admissionsScore(profile.sat, profile.gpa, satAverage, acceptanceRate);
  const f = financialScore(profile.budget, netPrice);
  const o = outcomesScore(grad);
  const l = locationScore(distanceMiles, profile.radius);
  // When the College Scorecard query successfully used a CIP filter, the school offers a relevant program.
  const c = profile.careerFiltered ? 92 : 72;
  const fit = Math.round(a * 0.36 + f * 0.24 + o * 0.18 + l * 0.12 + c * 0.10);

  return {
    id: raw.id ?? 0,
    name: raw["school.name"] ?? "Unknown college",
    city: raw["school.city"] ?? "",
    state: raw["school.state"] ?? "",
    ownership: raw["school.ownership"] ?? null,
    enrollment: raw["latest.student.size"] ?? null,
    satAverage,
    acceptanceRate,
    tuitionInState: raw["latest.cost.tuition.in_state"] ?? null,
    tuitionOutState: raw["latest.cost.tuition.out_of_state"] ?? null,
    netPrice,
    graduationRate: grad,
    lat,
    lon,
    distanceMiles: Math.round(distanceMiles),
    fitScore: fit,
    admissionsScore: a,
    financialScore: f,
    outcomesScore: o,
    locationScore: l,
    careerScore: c,
    category: admissionCategory(profile.sat, satAverage, acceptanceRate)
  };
}
