import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cadastro fechado",
};

/**
 * Cadastro público fechado — este é um sistema de uso restrito (ver
 * auth.ts: só a conta admin pode entrar). A rota continua existindo
 * (em vez de virar 404) só pra mostrar isso com clareza.
 */
export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro fechado</CardTitle>
        <CardDescription>Este é um sistema de uso restrito — não há cadastro público.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link href="/login" />} nativeButton={false} className="w-full">
          Ir para o login
        </Button>
      </CardContent>
    </Card>
  );
}
