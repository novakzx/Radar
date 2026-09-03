/**
 * Constrói um link `wa.me` a partir de um telefone em qualquer formato
 * (com espaços, parênteses, hífens, `+`, etc.). Função pura —
 * mesma entrada, mesma saída. Retorna `null` para números claramente
 * inválidos (poucos dígitos), para não gerar links quebrados.
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null;

  // OSM separa múltiplos telefones com ";" (às vezes "," ou "/"). Usamos
  // apenas o primeiro para não concatenar dois números num só.
  const firstPhone = phone.split(/[;,/]/)[0] ?? phone;
  const digits = firstPhone.replace(/\D/g, "");
  if (digits.length < 8) return null;

  const url = new URL(`https://wa.me/${digits}`);
  if (message) {
    url.searchParams.set("text", message);
  }
  return url.toString();
}
