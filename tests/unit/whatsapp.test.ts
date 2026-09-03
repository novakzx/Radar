import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  it("normaliza um telefone com formatação (espaços, +, parênteses)", () => {
    expect(buildWhatsAppUrl("+351 21 418 0330")).toBe("https://wa.me/351214180330");
    expect(buildWhatsAppUrl("(21) 4180-0330")).toBe("https://wa.me/2141800330");
  });

  it("inclui a mensagem pré-preenchida quando fornecida", () => {
    const url = buildWhatsAppUrl("+351214180330", "Olá! Vi sua empresa no AreaVon.");
    expect(url).toBe("https://wa.me/351214180330?text=Ol%C3%A1%21+Vi+sua+empresa+no+AreaVon.");
  });

  it("retorna null para telefone ausente ou vazio", () => {
    expect(buildWhatsAppUrl(null)).toBeNull();
    expect(buildWhatsAppUrl(undefined)).toBeNull();
    expect(buildWhatsAppUrl("")).toBeNull();
  });

  it("retorna null para números claramente inválidos (poucos dígitos)", () => {
    expect(buildWhatsAppUrl("123")).toBeNull();
  });

  it("é determinística: mesma entrada produz sempre a mesma saída", () => {
    expect(buildWhatsAppUrl("+351 911 914 981")).toBe(buildWhatsAppUrl("+351 911 914 981"));
  });

  it("usa apenas o primeiro número quando há vários separados por ; , ou /", () => {
    expect(buildWhatsAppUrl("+351 213 912 860;+351 919 231 646")).toBe(
      "https://wa.me/351213912860",
    );
    expect(buildWhatsAppUrl("351213912860,351919231646")).toBe("https://wa.me/351213912860");
  });
});
