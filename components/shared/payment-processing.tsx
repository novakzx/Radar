"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 20; // ~40s — o webhook do Stripe costuma confirmar em segundos.

/**
 * Fica perguntando ao nosso servidor (nunca ao Stripe direto, e nunca
 * confiando no simples fato de "voltamos do Stripe") se o webhook já
 * confirmou o pagamento. Só redireciona quando `hasPaid` vier true.
 */
export function PaymentProcessing() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const stopped = useRef(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      if (stopped.current) return;

      try {
        const response = await fetch("/api/payments/status", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { hasPaid: boolean };
          if (data.hasPaid) {
            stopped.current = true;
            router.replace("/dashboard");
            router.refresh();
            return;
          }
        }
      } catch (error) {
        console.error("[PaymentProcessing] falha ao consultar status", error);
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setFailed(true);
      } else {
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      stopped.current = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Ainda não recebemos a confirmação do pagamento. Isso pode levar mais alguns instantes, ou
          o pagamento pode não ter sido concluído.
        </p>
        <Button size="sm" onClick={() => window.location.reload()}>
          Verificar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Confirmando seu pagamento com o Stripe... isso leva só alguns segundos.
      </p>
    </div>
  );
}
