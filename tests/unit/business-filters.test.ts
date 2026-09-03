import { describe, expect, it } from "vitest";
import { applyResultFilters, sortResults } from "@/lib/business-filters";
import type { BusinessListItem } from "@/types/business";
import { DEFAULT_FILTERS } from "@/types/filters";

function makeBusiness(overrides: Partial<BusinessListItem>): BusinessListItem {
  return {
    id: "1",
    name: "Empresa",
    category: null,
    address: null,
    city: null,
    lat: null,
    lng: null,
    phone: null,
    photoUrl: null,
    rating: null,
    reviewCount: null,
    isIndependent: null,
    websiteVerification: {
      found: false,
      website: null,
      confidence: "baixa",
      hasSocialMedia: false,
      socialMediaUrl: null,
    },
    leadScore: { total: 0, breakdown: [], classification: "baixo" },
    lastVerifiedAt: null,
    sourcesConsulted: ["osm"],
    ...overrides,
  };
}

describe("sortResults", () => {
  const items = [
    makeBusiness({ id: "a", name: "Zebra", leadScore: { total: 30, breakdown: [], classification: "baixo" }, rating: 3, reviewCount: 5 }),
    makeBusiness({ id: "b", name: "Alpha", leadScore: { total: 90, breakdown: [], classification: "alto" }, rating: 4.8, reviewCount: 200 }),
    makeBusiness({ id: "c", name: "Meio", leadScore: { total: 60, breakdown: [], classification: "medio" }, rating: null, reviewCount: null }),
  ];

  it("ordena por lead score decrescente", () => {
    const sorted = sortResults(items, "lead_score_desc");
    expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("ordena por rating decrescente (nulos por último)", () => {
    const sorted = sortResults(items, "rating_desc");
    expect(sorted.map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  it("ordena por número de avaliações decrescente", () => {
    const sorted = sortResults(items, "reviews_desc");
    expect(sorted.map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  it("ordena por nome alfabeticamente", () => {
    const sorted = sortResults(items, "name_asc");
    expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("não modifica o array original", () => {
    const original = [...items];
    sortResults(items, "name_asc");
    expect(items).toEqual(original);
  });
});

describe("applyResultFilters", () => {
  const found = makeBusiness({
    id: "found",
    websiteVerification: {
      found: true,
      website: "https://x.pt",
      confidence: "alta",
      hasSocialMedia: false,
      socialMediaUrl: null,
    },
    rating: 4.5,
    phone: "123",
    isIndependent: false,
  });
  const notFound = makeBusiness({
    id: "not-found",
    websiteVerification: {
      found: false,
      website: null,
      confidence: "baixa",
      hasSocialMedia: false,
      socialMediaUrl: null,
    },
    rating: 3.0,
    phone: null,
    isIndependent: true,
  });

  it("sem filtros retorna todos ordenados pelo padrão", () => {
    const result = applyResultFilters([found, notFound], DEFAULT_FILTERS);
    expect(result).toHaveLength(2);
  });

  it("filtra por website encontrado", () => {
    const result = applyResultFilters([found, notFound], { ...DEFAULT_FILTERS, websiteStatus: "encontrado" });
    expect(result.map((i) => i.id)).toEqual(["found"]);
  });

  it("filtra por website não encontrado", () => {
    const result = applyResultFilters([found, notFound], { ...DEFAULT_FILTERS, websiteStatus: "nao_encontrado" });
    expect(result.map((i) => i.id)).toEqual(["not-found"]);
  });

  it("filtra por rating mínimo", () => {
    const result = applyResultFilters([found, notFound], { ...DEFAULT_FILTERS, minRating: 4 });
    expect(result.map((i) => i.id)).toEqual(["found"]);
  });

  it("filtra por negócio independente", () => {
    const result = applyResultFilters([found, notFound], { ...DEFAULT_FILTERS, onlyIndependent: true });
    expect(result.map((i) => i.id)).toEqual(["not-found"]);
  });

  it("filtra por telefone disponível", () => {
    const result = applyResultFilters([found, notFound], { ...DEFAULT_FILTERS, onlyWithPhone: true });
    expect(result.map((i) => i.id)).toEqual(["found"]);
  });

  it("combina múltiplos filtros (AND)", () => {
    const result = applyResultFilters([found, notFound], {
      ...DEFAULT_FILTERS,
      websiteStatus: "nao_encontrado",
      onlyIndependent: true,
    });
    expect(result.map((i) => i.id)).toEqual(["not-found"]);
  });

  it("é determinística", () => {
    const a = applyResultFilters([found, notFound], DEFAULT_FILTERS);
    const b = applyResultFilters([found, notFound], DEFAULT_FILTERS);
    expect(a).toEqual(b);
  });
});
