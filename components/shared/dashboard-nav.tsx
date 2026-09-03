"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/shared/logout-button";

const NAV_LINKS = [
  { href: "/radar", label: "Radar" },
  { href: "/crm", label: "CRM" },
  { href: "/equipe", label: "Equipe" },
];

interface DashboardNavProps {
  email: string;
  role: string;
}

/**
 * Header responsivo do painel: nav inline em telas médias/grandes,
 * menu hambúrguer em telas pequenas (evita o overflow horizontal que
 * o nome + nav + e-mail + badge causavam lado a lado no mobile).
 */
export function DashboardNav({ email, role }: DashboardNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="shrink-0 font-semibold tracking-tight transition-transform hover:scale-105"
          >
            AreaVon
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 transition-colors",
                    active ? "text-foreground" : "hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="absolute inset-0 rounded-md bg-muted"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <span className="max-w-[14rem] truncate text-sm text-muted-foreground">{email}</span>
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
          <LogoutButton />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 sm:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  "rounded-md px-3 py-2 " +
                  (pathname.startsWith(link.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{email}</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {role}
              </Badge>
            </div>
            <LogoutButton />
          </div>
        </div>
      )}
    </>
  );
}
