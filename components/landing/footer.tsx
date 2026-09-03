import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} CodeVision Radar.</span>
        <div className="flex gap-6">
          <Link href="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:text-foreground">
            Termos
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Entrar
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Criar conta
          </Link>
        </div>
      </div>
    </footer>
  );
}
