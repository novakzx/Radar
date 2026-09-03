import { z } from "zod";
import type { SourceWebsiteSignal, WebsiteVerificationResult } from "@/types/business";

const urlSchema = z.url();

/**
 * Normaliza e valida uma URL de website. Só é considerada válida se
 * for uma string não vazia, com esquema http(s) explícito, e passar na
 * validação de URL do Zod. Função pura — mesma entrada, mesma saída.
 */
export function normalizeWebsiteUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;

  const result = urlSchema.safeParse(trimmed);
  return result.success ? trimmed : null;
}

/**
 * Verificação determinística de website (seção 6 do briefing).
 *
 * Nunca afirma que uma empresa "não tem site": o resultado é sempre
 * relativo à(s) fonte(s) consultada(s). Regras:
 *
 * 🟢 Alta  — exatamente um website válido, vindo de campo estruturado.
 * 🔴 Baixa — mais de uma fonte estruturada informa websites diferentes
 *            (fontes discordam sobre a existência/identidade do site).
 * 🟡 Média — nenhum website válido, mas há link de rede social.
 * 🔴 Baixa — nenhuma fonte retornou website nem rede social.
 */
export function verifyWebsite(signals: SourceWebsiteSignal[]): WebsiteVerificationResult {
  const normalizedUrls = signals
    .map((signal) => normalizeWebsiteUrl(signal.website))
    .filter((url): url is string => url !== null);

  const distinctUrls = Array.from(new Set(normalizedUrls));
  const hasSocialMedia = signals.some((signal) => !!signal.socialMediaUrl?.trim());

  if (distinctUrls.length === 1) {
    return { found: true, website: distinctUrls[0], confidence: "alta", hasSocialMedia };
  }

  if (distinctUrls.length > 1) {
    return { found: false, website: null, confidence: "baixa", hasSocialMedia };
  }

  if (hasSocialMedia) {
    return { found: false, website: null, confidence: "media", hasSocialMedia };
  }

  return { found: false, website: null, confidence: "baixa", hasSocialMedia };
}

/** Rótulo de UI: nunca afirma ausência real de site, só ausência na fonte consultada. */
export function websiteStatusLabel(result: WebsiteVerificationResult): string {
  return result.found
    ? "Website encontrado na fonte consultada"
    : "Website não encontrado na fonte consultada";
}
