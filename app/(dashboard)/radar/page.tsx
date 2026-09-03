import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchForm } from "@/components/shared/search-form";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Radar",
  robots: { index: false, follow: false },
};

export default async function RadarPage() {
  const session = await verifySession();

  const recentSearches = await prisma.search.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Radar de prospecção</h1>
        <p className="text-muted-foreground">
          Pesquise uma região e descubra empresas com website não encontrado na fonte
          consultada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova busca</CardTitle>
          <CardDescription>
            A busca roda em segundo plano — o progresso exibido é sempre real, nunca simulado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchForm />
        </CardContent>
      </Card>

      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Buscas recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSearches.map((search) => (
              <Link
                key={search.id}
                href={`/radar/${search.id}`}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
              >
                <span>
                  {search.location} · {search.category ?? search.keyword} · {search.radiusKm}km
                </span>
                <Badge
                  variant={
                    search.status === "done"
                      ? "secondary"
                      : search.status === "error"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {search.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
