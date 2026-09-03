"use client";

import { useState, useTransition } from "react";
import { resendVerificationCodeAction } from "@/lib/actions/email-verification";
import { Button } from "@/components/ui/button";

export function ResendCodeButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await resendVerificationCodeAction();
      setMessage(result?.message ?? null);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button variant="ghost" size="sm" disabled={isPending} onClick={handleClick}>
        {isPending ? "Enviando..." : "Reenviar código"}
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
