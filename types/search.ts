export const SEARCH_STEPS = [
  "geocoding",
  "fetching",
  "verifying_websites",
  "scoring",
] as const;

export type SearchStepKey = (typeof SEARCH_STEPS)[number];
export type StepStatusKey = "pending" | "running" | "done" | "error";

export type SearchProgress = Record<SearchStepKey, StepStatusKey>;

export interface CreateSearchInput {
  userId: string;
  location: string;
  radiusKm: number;
  category?: string | null;
  keyword?: string | null;
}
