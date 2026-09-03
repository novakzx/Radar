import { describe, expect, it } from "vitest";
import { normalizeWebsiteUrl, verifyWebsite, websiteStatusLabel } from "@/services/WebsiteVerificationService";
import type { SourceWebsiteSignal } from "@/types/business";

describe("normalizeWebsiteUrl", () => {
  it("aceita URLs http/https válidas", () => {
    expect(normalizeWebsiteUrl("https://exemplo.pt")).toBe("https://exemplo.pt");
    expect(normalizeWebsiteUrl("http://exemplo.pt")).toBe("http://exemplo.pt");
  });

  it("rejeita valores nulos, vazios ou sem esquema http(s)", () => {
    expect(normalizeWebsiteUrl(null)).toBeNull();
    expect(normalizeWebsiteUrl(undefined)).toBeNull();
    expect(normalizeWebsiteUrl("")).toBeNull();
    expect(normalizeWebsiteUrl("   ")).toBeNull();
    expect(normalizeWebsiteUrl("exemplo.pt")).toBeNull();
    expect(normalizeWebsiteUrl("ftp://exemplo.pt")).toBeNull();
  });

  it("rejeita strings malformadas mesmo com prefixo http", () => {
    expect(normalizeWebsiteUrl("https://")).toBeNull();
  });
});

describe("verifyWebsite", () => {
  it("🟢 alta: um único website válido vindo de fonte estruturada", () => {
    const signals: SourceWebsiteSignal[] = [
      { source: "osm", website: "https://barbearia-exemplo.pt" },
    ];
    const result = verifyWebsite(signals);
    expect(result).toEqual({
      found: true,
      website: "https://barbearia-exemplo.pt",
      confidence: "alta",
      hasSocialMedia: false,
      socialMediaUrl: null,
    });
  });

  it("🟡 média: sem website válido, mas com rede social", () => {
    const signals: SourceWebsiteSignal[] = [
      { source: "osm", website: null, socialMediaUrl: "https://instagram.com/barbearia" },
    ];
    const result = verifyWebsite(signals);
    expect(result.found).toBe(false);
    expect(result.confidence).toBe("media");
    expect(result.hasSocialMedia).toBe(true);
    expect(result.socialMediaUrl).toBe("https://instagram.com/barbearia");
  });

  it("🔴 baixa: nenhuma fonte retorna website nem rede social", () => {
    const signals: SourceWebsiteSignal[] = [{ source: "osm", website: null, socialMediaUrl: null }];
    const result = verifyWebsite(signals);
    expect(result).toEqual({
      found: false,
      website: null,
      confidence: "baixa",
      hasSocialMedia: false,
      socialMediaUrl: null,
    });
  });

  it("🔴 baixa: fontes diferentes discordam sobre qual é o website", () => {
    const signals: SourceWebsiteSignal[] = [
      { source: "osm", website: "https://site-a.pt" },
      { source: "google_places", website: "https://site-b.pt" },
    ];
    const result = verifyWebsite(signals);
    expect(result.found).toBe(false);
    expect(result.confidence).toBe("baixa");
  });

  it("trata múltiplas fontes que concordam como alta confiança (sem duplicar)", () => {
    const signals: SourceWebsiteSignal[] = [
      { source: "osm", website: "https://site-a.pt" },
      { source: "google_places", website: "https://site-a.pt" },
    ];
    const result = verifyWebsite(signals);
    expect(result.found).toBe(true);
    expect(result.confidence).toBe("alta");
    expect(result.website).toBe("https://site-a.pt");
  });

  it("lista vazia de sinais resulta em baixa confiança, não encontrado", () => {
    expect(verifyWebsite([])).toEqual({
      found: false,
      website: null,
      confidence: "baixa",
      hasSocialMedia: false,
      socialMediaUrl: null,
    });
  });

  it("expõe a URL real da rede social quando disponível", () => {
    const result = verifyWebsite([
      { source: "osm", website: null, socialMediaUrl: "https://facebook.com/barbearia" },
    ]);
    expect(result.socialMediaUrl).toBe("https://facebook.com/barbearia");
  });

  it("é determinística: mesma entrada produz sempre a mesma saída", () => {
    const signals: SourceWebsiteSignal[] = [
      { source: "osm", website: null, socialMediaUrl: "https://facebook.com/x" },
    ];
    expect(verifyWebsite(signals)).toEqual(verifyWebsite(signals));
  });
});

describe("websiteStatusLabel", () => {
  it("nunca afirma ausência real de site — só ausência na fonte consultada", () => {
    const notFound = verifyWebsite([{ source: "osm", website: null }]);
    expect(websiteStatusLabel(notFound)).toBe("Website não encontrado na fonte consultada");
    expect(websiteStatusLabel(notFound)).not.toMatch(/não tem site/i);
  });

  it("confirma encontrado quando há website válido", () => {
    const found = verifyWebsite([{ source: "osm", website: "https://exemplo.pt" }]);
    expect(websiteStatusLabel(found)).toBe("Website encontrado na fonte consultada");
  });
});
