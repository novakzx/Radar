import { describe, expect, it } from "vitest";
import { normalizeBusinessName } from "@/lib/text";
import { haversineDistanceMeters, metersToDegreeDelta } from "@/lib/geo";

describe("normalizeBusinessName", () => {
  it("remove acentos, caixa e espaços redundantes", () => {
    expect(normalizeBusinessName("  Barbearia São João  ")).toBe("barbearia sao joao");
  });

  it("remove sufixos societários comuns", () => {
    expect(normalizeBusinessName("Café Central Lda")).toBe("cafe central");
    expect(normalizeBusinessName("Café Central Unipessoal Lda")).toBe("cafe central");
    expect(normalizeBusinessName("Oficina Modelo, S.A.")).toBe("oficina modelo");
  });

  it("é determinística e idempotente", () => {
    const once = normalizeBusinessName("Salão de Beleza Estrela Lda");
    const twice = normalizeBusinessName(once);
    expect(once).toBe(twice);
  });
});

describe("haversineDistanceMeters", () => {
  it("retorna ~0 para o mesmo ponto", () => {
    expect(haversineDistanceMeters(38.6795, -9.1638, 38.6795, -9.1638)).toBeCloseTo(0, 1);
  });

  it("calcula distância aproximada correta entre dois pontos conhecidos", () => {
    // Almada (~38.6795, -9.1638) a Lisboa (~38.7223, -9.1393): ~5.3km
    const distance = haversineDistanceMeters(38.6795, -9.1638, 38.7223, -9.1393);
    expect(distance).toBeGreaterThan(4500);
    expect(distance).toBeLessThan(6000);
  });

  it("é simétrica", () => {
    const a = haversineDistanceMeters(38.6795, -9.1638, 38.7223, -9.1393);
    const b = haversineDistanceMeters(38.7223, -9.1393, 38.6795, -9.1638);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("metersToDegreeDelta", () => {
  it("é determinística e cresce com o raio", () => {
    expect(metersToDegreeDelta(100)).toBeLessThan(metersToDegreeDelta(1000));
  });
});
