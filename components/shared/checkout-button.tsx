"use client";

import { useState, useTransition } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCheckoutAction } from "@/lib/actions/payments";

export function CheckoutButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      // Em caso de sucesso a action faz redirect() e este código nunca
      // retorna; só chega aqui em caso de erro/rate limit.
      const result = await startCheckoutAction();
      if (result?.message) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button size="lg" disabled={isPending} onClick={handleClick} className="h-12 px-8">
        <CreditCard className="size-4" />
        {isPending ? "Abrindo checkout seguro..." : "Pagar €2 com Stripe"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Pagamento único · processado pelo Stripe</p>
    </div>
  );
}
