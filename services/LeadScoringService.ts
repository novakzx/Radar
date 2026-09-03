import type { LeadScoreResult, LeadScoringInput, ScoreReason } from "@/types/business";

const REVIEW_COUNT_THRESHOLD = 100;
const RATING_THRESHOLD = 4.0;
const MAX_SCORE = 100;

/**
 * Lead Score determinístico (seção 7 do briefing). Função pura: mesma
 * entrada, mesma saída, sempre — nenhuma chamada a IA/heurística não
 * determinística. Coberta por testes unitários em
 * tests/unit/lead-scoring.test.ts.
 */
export function calculateLeadScore(input: LeadScoringInput): LeadScoreResult {
  const breakdown: ScoreReason[] = [];

  if (!input.websiteFound) {
    breakdown.push({
      key: "no_website",
      label: "Website não encontrado na fonte consultada",
      points: 50,
    });
  }

  if (input.phone) {
    breakdown.push({ key: "phone", label: "Telefone disponível", points: 10 });
  }

  if (input.hasSocialMedia) {
    breakdown.push({ key: "social_media", label: "Rede social disponível", points: 10 });
  }

  if ((input.reviewCount ?? 0) > REVIEW_COUNT_THRESHOLD) {
    breakdown.push({
      key: "review_count",
      label: "Mais de 100 avaliações",
      points: 10,
    });
  }

  if ((input.rating ?? 0) > RATING_THRESHOLD) {
    breakdown.push({ key: "rating", label: "Rating acima de 4.0", points: 10 });
  }

  if (input.isIndependent) {
    breakdown.push({
      key: "independent",
      label: "Negócio local independente (sem indicação de rede/franquia)",
      points: 10,
    });
  }

  const rawTotal = breakdown.reduce((sum, reason) => sum + reason.points, 0);
  const total = Math.min(rawTotal, MAX_SCORE);

  return {
    total,
    breakdown,
    classification: classify(total),
  };
}

function classify(total: number): LeadScoreResult["classification"] {
  if (total >= 80) return "alto";
  if (total >= 50) return "medio";
  return "baixo";
}
