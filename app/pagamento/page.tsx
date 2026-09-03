import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Kanban, MapPinned, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { userHasPaidAccess } from "@/services/PaymentService";
import { requiresPayment } from "@/lib/payment-gate";
import { isEmailVerified } from "@/services/EmailVerificationService";
import { requiresEmailVerification } from "@/lib/email-verification-gate";
import { LogoutButton } from "@/components/shared/logout-button";
import { CheckoutButton } from "@/components/shared/checkout-button";

export const metadata: Metadata = {
  title: "Desbloquear acesso",
  robots: { index: false, follow: false },
};

const UNLOCKS = [
  { icon: MapPinned, label: "Radar de prospecção" },
  { icon: Kanban, label: "CRM em kanban" },
  { icon: Users2, label: "Página da Equipe" },
  { icon: Bookmark, label: "Dashboard com métricas" },
];

export default async function PagamentoPage(props: PageProps<"/pagamento">) {
  const session = await verifySession();

  // Defesa em profundidade: mesma ordem do layout do dashboard — não
  // faz sentido cobrar antes de confirmar o e-mail.
  const emailVerified = session.user.role === "admin" ? true : await isEmailVerified(session.user.id);
  if (requiresEmailVerification({ role: session.user.role, emailVerified })) {
    redirect("/verificar-email");
  }

  // Admin e quem já pagou não precisam ver esta página.
  const hasPaid = session.user.role === "admin" ? true : await userHasPaidAccess(session.user.id);
  if (!requiresPayment({ role: session.user.role, hasPaid })) {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const wasCancelled = searchParams.cancelado === "1";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <Link href="/pagamento" className="font-semibold tracking-tight">
          AreaVon
        </Link>
        <LogoutButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Desbloqueie o acesso</CardTitle>
            <CardDescription>
              Um pagamento único de <span className="font-semibold text-foreground">€2</span> libera
              todos os painéis da sua conta — sem assinatura, sem cobrança recorrente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {wasCancelled && (
              <p className="rounded-md border border-status-warning/30 bg-status-warning/10 px-3 py-2 text-sm text-status-warning">
                Pagamento cancelado. Você pode tentar novamente quando quiser.
              </p>
            )}

            <ul className="grid grid-cols-2 gap-3 text-sm">
              {UNLOCKS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4 shrink-0 text-foreground" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex justify-center border-t border-border pt-6">
              <CheckoutButton />
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Problemas com o pagamento?{" "}
              <Link href="/suporte" className="underline underline-offset-2 hover:text-foreground">
                Abrir um ticket com a equipe
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
