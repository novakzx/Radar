import type { BusinessListItem } from "@/types/business";
import type { ResultFilters, SortKey } from "@/types/filters";

/** Ordena uma lista de resultados de forma determinística. Função pura. */
export function sortResults(items: BusinessListItem[], sortBy: SortKey): BusinessListItem[] {
  const copy = [...items];

  switch (sortBy) {
    case "lead_score_desc":
      copy.sort((a, b) => b.leadScore.total - a.leadScore.total);
      break;
    case "rating_desc":
      copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
      break;
    case "reviews_desc":
      copy.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
      break;
    case "name_asc":
      copy.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      break;
  }

  return copy;
}

/** Aplica os filtros da UI (status de website, rating mínimo, etc.) e ordena. Função pura. */
export function applyResultFilters(
  items: BusinessListItem[],
  filters: ResultFilters,
): BusinessListItem[] {
  const filtered = items.filter((item) => {
    if (filters.websiteStatus === "encontrado" && !item.websiteVerification.found) {
      return false;
    }
    if (filters.websiteStatus === "nao_encontrado" && item.websiteVerification.found) {
      return false;
    }
    if (filters.minRating > 0 && (item.rating ?? 0) < filters.minRating) {
      return false;
    }
    if (filters.onlyIndependent && !item.isIndependent) {
      return false;
    }
    if (filters.onlyWithPhone && !item.phone) {
      return false;
    }
    return true;
  });

  return sortResults(filtered, filters.sortBy);
}
