export type AdmissionCategory = "Likely" | "Target" | "Reach" | "High Reach";

export type RecommendedCollege = {
  id: number;
  name: string;
  city: string;
  state: string;
  ownership?: number | null;
  enrollment?: number | null;
  satAverage?: number | null;
  acceptanceRate?: number | null;
  tuitionInState?: number | null;
  tuitionOutState?: number | null;
  netPrice?: number | null;
  graduationRate?: number | null;
  lat?: number | null;
  lon?: number | null;
  distanceMiles?: number | null;
  fitScore: number;
  admissionsScore: number;
  financialScore: number;
  outcomesScore: number;
  locationScore: number;
  careerScore: number;
  category: AdmissionCategory;
};

export type HomeLocation = {
  label: string;
  zip: string;
  lat: number;
  lon: number;
};
