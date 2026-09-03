import { describe, expect, it } from "vitest";
import { requiresEmailVerification } from "@/lib/email-verification-gate";

describe("requiresEmailVerification", () => {
  it("admin nunca precisa verificar o e-mail", () => {
    expect(requiresEmailVerification({ role: "admin", emailVerified: false })).toBe(false);
    expect(requiresEmailVerification({ role: "admin", emailVerified: true })).toBe(false);
  });

  it("membro com e-mail já verificado não precisa verificar de novo", () => {
    expect(requiresEmailVerification({ role: "member", emailVerified: true })).toBe(false);
  });

  it("membro sem e-mail verificado precisa verificar", () => {
    expect(requiresEmailVerification({ role: "member", emailVerified: false })).toBe(true);
  });
});
