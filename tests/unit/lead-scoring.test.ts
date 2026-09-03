import { describe, expect, it } from "vitest";
import { calculateLeadScore } from "@/services/LeadScoringService";
import type { LeadScoringInput } from "@/types/business";

const base: LeadScoringInput = {
  websiteFound: true,
  phone: null,
  hasSocialMedia: false,
  reviewCount: null,
  rating: null,
  isIndependent: false,
};

describe("calculateLeadScore", () => {
  it("retorna 0 e classificação baixa quando nenhum critério é atendido", () => {
    const result = calculateLeadScore(base);
    expect(result.total).toBe(0);
    expect(result.breakdown).toHaveLength(0);
    expect(result.classification).toBe("baixo");
  });

  it("soma 50 pontos quando o website não é encontrado na fonte consultada", () => {
    const result = calculateLeadScore({ ...base, websiteFound: false });
    expect(result.total).toBe(50);
    expect(result.breakdown).toEqual([
      { key: "no_website", label: "Website não encontrado na fonte consultada", points: 50 },
    ]);
    expect(result.classification).toBe("medio");
  });

  it("soma 10 pontos quando há telefone disponível", () => {
    const result = calculateLeadScore({ ...base, phone: "+351 210 000 000" });
    expect(result.total).toBe(10);
    expect(result.breakdown[0].key).toBe("phone");
  });

  it("soma 10 pontos quando há rede social disponível", () => {
    const result = calculateLeadScore({ ...base, hasSocialMedia: true });
    expect(result.total).toBe(10);
    expect(result.breakdown[0].key).toBe("social_media");
  });

  it("soma 10 pontos quando há mais de 100 avaliações (estritamente > 100)", () => {
    expect(calculateLeadScore({ ...base, reviewCount: 100 }).total).toBe(0);
    expect(calculateLeadScore({ ...base, reviewCount: 101 }).total).toBe(10);
  });

  it("soma 10 pontos quando o rating é acima de 4.0 (estritamente > 4.0)", () => {
    expect(calculateLeadScore({ ...base, rating: 4.0 }).total).toBe(0);
    expect(calculateLeadScore({ ...base, rating: 4.1 }).total).toBe(10);
  });

  it("soma 10 pontos quando o negócio é independente", () => {
    const result = calculateLeadScore({ ...base, isIndependent: true });
    expect(result.total).toBe(10);
    expect(result.breakdown[0].key).toBe("independent");
  });

  it("não pontua critérios ausentes (dados nulos nunca geram pontos)", () => {
    const result = calculateLeadScore({
      websiteFound: true,
      phone: undefined,
      hasSocialMedia: false,
      reviewCount: undefined,
      rating: undefined,
      isIndependent: undefined,
    });
    expect(result.total).toBe(0);
  });

  it("combina todos os critérios somando exatamente 100 (sem sobra)", () => {
    const result = calculateLeadScore({
      websiteFound: false,
      phone: "+351 210 000 000",
      hasSocialMedia: true,
      reviewCount: 250,
      rating: 4.8,
      isIndependent: true,
    });
    expect(result.total).toBe(100);
    expect(result.breakdown).toHaveLength(6);
    expect(result.classification).toBe("alto");
  });

  it("nunca ultrapassa 100 mesmo com pontuação bruta maior (Math.min de segurança)", () => {
    // Simula um cenário hipotético onde critérios futuros somariam mais que 100.
    const result = calculateLeadScore({
      websiteFound: false,
      phone: "x",
      hasSocialMedia: true,
      reviewCount: 999,
      rating: 5,
      isIndependent: true,
    });
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("classificação 'baixo' até 49 pontos (ex.: 40 pontos)", () => {
    // phone(10) + social(10) + independent(10) + rating>4.0(10) = 40, websiteFound=true (sem os 50)
    const result = calculateLeadScore({
      ...base,
      phone: "x",
      hasSocialMedia: true,
      isIndependent: true,
      rating: 4.5,
    });
    expect(result.total).toBe(40);
    expect(result.classification).toBe("baixo");
  });

  it("classificação 'medio' entre 50 e 79 pontos inclusive", () => {
    const result = calculateLeadScore({ ...base, websiteFound: false, phone: "x" }); // 50+10=60
    expect(result.total).toBe(60);
    expect(result.classification).toBe("medio");
  });

  it("classificação 'alto' a partir de 80 pontos", () => {
    const result = calculateLeadScore({
      websiteFound: false,
      phone: "x",
      hasSocialMedia: true,
      reviewCount: 200,
      rating: null,
      isIndependent: false,
    }); // 50+10+10+10 = 80
    expect(result.total).toBe(80);
    expect(result.classification).toBe("alto");
  });

  it("é determinística: mesma entrada produz sempre a mesma saída", () => {
    const input: LeadScoringInput = {
      websiteFound: false,
      phone: "+351 210 000 000",
      hasSocialMedia: true,
      reviewCount: 50,
      rating: 3.9,
      isIndependent: true,
    };
    const first = calculateLeadScore(input);
    const second = calculateLeadScore(input);
    expect(first).toEqual(second);
  });
});
