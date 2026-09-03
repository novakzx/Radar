import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="text-sm uppercase tracking-widest text-muted-foreground">
        AreaVon
      </span>
      <h1 className="text-6xl font-semibold tracking-tight">404</h1>
      <p className="max-w-md text-muted-foreground">
        Esta página não foi encontrada. Verifique o endereço ou volte para o início.
      </p>
      <Button nativeButton={false} render={<Link href="/">Voltar ao início</Link>} />
    </main>
  );
}
