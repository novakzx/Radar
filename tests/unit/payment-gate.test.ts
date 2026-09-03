import { describe, expect, it } from "vitest";
import { requiresPayment } from "@/lib/payment-gate";

describe("requiresPayment", () => {
  it("admin nunca precisa pagar, mesmo sem hasPaid", () => {
    expect(requiresPayment({ role: "admin", hasPaid: false })).toBe(false);
    expect(requiresPayment({ role: "admin", hasPaid: true })).toBe(false);
  });

  it("membro que já pagou não precisa pagar de novo", () => {
    expect(requiresPayment({ role: "member", hasPaid: true })).toBe(false);
  });

  it("membro que ainda não pagou precisa pagar", () => {
    expect(requiresPayment({ role: "member", hasPaid: false })).toBe(true);
  });
});
