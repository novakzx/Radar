import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { isEmailVerified } from "@/services/EmailVerificationService";
import { LogoutButton } from "@/components/shared/logout-button";
import { VerifyEmailForm } from "@/components/shared/verify-email-form";
import { ResendCodeButton } from "@/components/shared/resend-code-button";

export const metadata: Metadata = {
  title: "Verificar e-mail",
  robots: { index: false, follow: false },
};

export default async function VerificarEmailPage() {
  const session = await verifySession();

  if (session.user.role === "admin" || (await isEmailVerified(session.user.id))) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <Link href="/verificar-email" className="font-semibold tracking-tight">
          AreaVon
        </Link>
        <LogoutButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Confirme seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um código de 6 dígitos para{" "}
              <span className="text-foreground">{session.user.email}</span>. Ele expira em 15
              minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VerifyEmailForm />
            <div className="border-t border-border pt-4">
              <ResendCodeButton />
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Não recebeu o e-mail?{" "}
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
