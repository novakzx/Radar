import { describe, expect, it } from "vitest";
import { buildSocialUrl, extractOsmContactInfo, isSocialMediaUrl } from "@/lib/osm-mapping";

describe("buildSocialUrl", () => {
  it("monta a URL a partir de um handle simples", () => {
    expect(buildSocialUrl("minhaempresa", "instagram.com")).toBe(
      "https://instagram.com/minhaempresa",
    );
  });

  it("remove o @ de um handle", () => {
    expect(buildSocialUrl("@minhaempresa", "instagram.com")).toBe(
      "https://instagram.com/minhaempresa",
    );
  });

  it("usa a URL como está quando já é http(s)", () => {
    expect(buildSocialUrl("https://instagram.com/minhaempresa", "instagram.com")).toBe(
      "https://instagram.com/minhaempresa",
    );
  });

  it("retorna null para valor ausente ou vazio", () => {
    expect(buildSocialUrl(undefined, "instagram.com")).toBeNull();
    expect(buildSocialUrl("", "instagram.com")).toBeNull();
  });
});

describe("isSocialMediaUrl", () => {
  it("reconhece os principais domínios de rede social", () => {
    expect(isSocialMediaUrl("https://www.instagram.com/x")).toBe(true);
    expect(isSocialMediaUrl("https://facebook.com/x")).toBe(true);
    expect(isSocialMediaUrl("https://x.com/x")).toBe(true);
    expect(isSocialMediaUrl("https://www.linkedin.com/company/x")).toBe(true);
    expect(isSocialMediaUrl("https://www.tiktok.com/@x")).toBe(true);
    expect(isSocialMediaUrl("https://wa.me/351911111111")).toBe(true);
  });

  it("não confunde um site próprio com rede social", () => {
    expect(isSocialMediaUrl("https://minhaempresa.pt")).toBe(false);
    expect(isSocialMediaUrl("https://www.minhaempresa.com")).toBe(false);
  });

  it("retorna false para uma URL inválida em vez de lançar erro", () => {
    expect(isSocialMediaUrl("não é uma url")).toBe(false);
  });
});

describe("extractOsmContactInfo", () => {
  it("lê contact:instagram e contact:facebook (compatibilidade com o comportamento anterior)", () => {
    expect(extractOsmContactInfo({ "contact:instagram": "minhaempresa" }).socialMediaUrl).toBe(
      "https://instagram.com/minhaempresa",
    );
    expect(extractOsmContactInfo({ "contact:facebook": "minhaempresa" }).socialMediaUrl).toBe(
      "https://facebook.com/minhaempresa",
    );
  });

  it("também lê tags de rede social sem o prefixo contact: e outras plataformas", () => {
    expect(extractOsmContactInfo({ instagram: "minhaempresa" }).socialMediaUrl).toBe(
      "https://instagram.com/minhaempresa",
    );
    expect(extractOsmContactInfo({ "contact:twitter": "minhaempresa" }).socialMediaUrl).toBe(
      "https://twitter.com/minhaempresa",
    );
    expect(extractOsmContactInfo({ "contact:linkedin": "minhaempresa" }).socialMediaUrl).toBe(
      "https://linkedin.com/minhaempresa",
    );
    expect(extractOsmContactInfo({ tiktok: "minhaempresa" }).socialMediaUrl).toBe(
      "https://tiktok.com/minhaempresa",
    );
  });

  it("mantém website e rede social como campos separados quando ambos existem", () => {
    const result = extractOsmContactInfo({
      website: "https://minhaempresa.pt",
      "contact:instagram": "minhaempresa",
    });
    expect(result.website).toBe("https://minhaempresa.pt");
    expect(result.socialMediaUrl).toBe("https://instagram.com/minhaempresa");
  });

  it("reclassifica como rede social quando o campo website na verdade é um link de rede social", () => {
    const result = extractOsmContactInfo({ website: "https://www.facebook.com/minhaempresa" });
    expect(result.website).toBeNull();
    expect(result.socialMediaUrl).toBe("https://www.facebook.com/minhaempresa");
  });

  it("retorna null/null quando não há nenhuma informação", () => {
    expect(extractOsmContactInfo({})).toEqual({ website: null, socialMediaUrl: null });
  });
});
