"use client";

import { useActionState } from "react";
import { verifyEmailCodeAction, type VerifyEmailState } from "@/lib/actions/email-verification";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: VerifyEmailState = undefined;

export function VerifyEmailForm() {
  const [state, action, pending] = useActionState(verifyEmailCodeAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <Input
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        placeholder="000000"
        autoFocus
        className="h-14 text-center text-2xl font-semibold tracking-[0.5em]"
        required
      />
      {state?.message && <p className="text-center text-sm text-destructive">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Verificando..." : "Verificar código"}
      </Button>
    </form>
  );
}
