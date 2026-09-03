import Link from "next/link";
import { InstagramIcon } from "@/components/shared/icons";

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} AreaVon.</span>
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/area.von"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <InstagramIcon className="size-4" />
            @area.von
          </a>
          <Link href="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:text-foreground">
            Termos
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
}
