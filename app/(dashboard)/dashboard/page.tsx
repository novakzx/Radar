import type { Metadata } from "next";
import { Building2, Globe2, Bookmark, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { getDashboardData } from "@/services/DashboardService";
import { SummaryCard } from "@/components/shared/dashboard/summary-card";
import { BarListChart } from "@/components/shared/dashboard/bar-list-chart";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await verifySession();
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight break-words">
          Olá, {session.user.email}
        </h1>
        <p className="text-muted-foreground">
          Visão geral da prospecção — todos os números vêm direto do banco de dados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScrollReveal y={16}>
          <SummaryCard label="Empresas encontradas" value={data.summary.totalBusinesses} icon={Building2} />
        </ScrollReveal>
        <ScrollReveal y={16} delay={0.05}>
          <SummaryCard
            label="Website não encontrado"
            value={data.summary.businessesWithoutWebsite}
            icon={Globe2}
            tone="warning"
          />
        </ScrollReveal>
        <ScrollReveal y={16} delay={0.1}>
          <SummaryCard label="Leads salvos" value={data.summary.savedLeads} icon={Bookmark} />
        </ScrollReveal>
        <ScrollReveal y={16} delay={0.15}>
          <SummaryCard label="Clientes" value={data.summary.clients} icon={Trophy} tone="success" />
        </ScrollReveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScrollReveal y={16} delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>Empresas por categoria</CardTitle>
              <CardDescription>Top categorias entre as empresas já encontradas.</CardDescription>
            </CardHeader>
            <CardContent>
              <BarListChart
                items={data.businessesByCategory.map((c) => ({ label: c.category, count: c.count }))}
                emptyLabel="Nenhuma busca realizada ainda."
              />
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal y={16} delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Leads por estágio</CardTitle>
              <CardDescription>Funil do kanban — quantidade de leads em cada estágio.</CardDescription>
            </CardHeader>
            <CardContent>
              <BarListChart
                items={data.leadsByStatus.map((s) => ({ label: s.label, count: s.count }))}
                emptyLabel="Nenhum lead salvo ainda."
              />
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal y={16} delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Regiões com mais oportunidades</CardTitle>
              <CardDescription>
                Cidades com mais empresas de website não encontrado na fonte consultada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarListChart
                items={data.topRegionsByOpportunity.map((r) => ({ label: r.city, count: r.count }))}
                emptyLabel="Nenhuma oportunidade identificada ainda."
              />
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal y={16} delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Taxa de conversão
              </CardTitle>
              <CardDescription>Percentual de leads salvos que viraram clientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight">{data.conversionRate}%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.summary.clients} de {data.summary.savedLeads} leads salvos
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
