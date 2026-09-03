/**
 * Normaliza texto para comparação determinística: minúsculas, sem
 * acentos, sem sufixos societários comuns (Lda, Unipessoal, S.A. etc.)
 * e sem espaços redundantes. Usado na deduplicação de empresas
 * (seção 5) — nunca deve depender de IA/heurística não determinística.
 */
const COMPANY_SUFFIXES = [
  "unipessoal lda",
  "unipessoal",
  "sociedade unipessoal lda",
  "lda",
  "ltda",
  "s\\.a\\.",
  "sa",
  "s\\.r\\.l\\.",
];

export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizeBusinessName(name: string): string {
  let normalized = stripAccents(name.toLowerCase().trim());
  normalized = normalized.replace(/[.,]/g, "");

  const suffixPattern = new RegExp(`\\b(${COMPANY_SUFFIXES.join("|")})\\b`, "gi");
  normalized = normalized.replace(suffixPattern, "");

  return normalized.replace(/\s+/g, " ").trim();
}
