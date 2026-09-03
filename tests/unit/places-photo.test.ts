import { describe, expect, it } from "vitest";
import { extractOsmPhotoUrl } from "@/lib/osm-mapping";

describe("extractOsmPhotoUrl", () => {
  it("usa a tag image diretamente quando já é uma URL http(s)", () => {
    const url = extractOsmPhotoUrl({ image: "https://exemplo.pt/foto.jpg" });
    expect(url).toBe("https://exemplo.pt/foto.jpg");
  });

  it("resolve a tag image quando referencia um arquivo do Wikimedia Commons", () => {
    const url = extractOsmPhotoUrl({ image: "File:Barbearia Exemplo.jpg" });
    expect(url).toBe(
      "https://commons.wikimedia.org/wiki/Special:FilePath/Barbearia%20Exemplo.jpg?width=480",
    );
  });

  it("usa wikimedia_commons quando não há tag image", () => {
    const url = extractOsmPhotoUrl({ wikimedia_commons: "File:Fachada.jpg" });
    expect(url).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/Fachada.jpg?width=480");
  });

  it("retorna null quando não há nenhuma tag de imagem utilizável", () => {
    expect(extractOsmPhotoUrl({})).toBeNull();
    expect(extractOsmPhotoUrl({ wikimedia_commons: "Category:Barbearias" })).toBeNull();
  });

  it("é determinística: mesma entrada produz sempre a mesma saída", () => {
    const tags = { image: "File:X.jpg" };
    expect(extractOsmPhotoUrl(tags)).toBe(extractOsmPhotoUrl(tags));
  });
});
