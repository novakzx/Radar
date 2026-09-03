export type WebsiteStatusFilter = "todos" | "encontrado" | "nao_encontrado";
export type SortKey = "lead_score_desc" | "rating_desc" | "reviews_desc" | "name_asc";

export interface ResultFilters {
  websiteStatus: WebsiteStatusFilter;
  minRating: number; // 0 = sem filtro
  onlyIndependent: boolean;
  onlyWithPhone: boolean;
  sortBy: SortKey;
}

export const DEFAULT_FILTERS: ResultFilters = {
  websiteStatus: "todos",
  minRating: 0,
  onlyIndependent: false,
  onlyWithPhone: false,
  sortBy: "lead_score_desc",
};
