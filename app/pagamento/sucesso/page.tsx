import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { PaymentProcessing } from "@/components/shared/payment-processing";

export const metadata: Metadata = {
  title: "Confirmando pagamento",
  robots: { index: false, follow: false },
};

export default async function PagamentoSucessoPage() {
  // Só garante que há uma sessão — o acesso em si é liberado pelo
  // webhook do Stripe, nunca por chegar nesta página.
  await verifySession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Quase lá</CardTitle>
          <CardDescription>Estamos confirmando seu pagamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentProcessing />
        </CardContent>
      </Card>
    </div>
  );
}
