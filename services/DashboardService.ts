import "server-only";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/types/lead";
import type { DashboardData } from "@/types/dashboard";

const TOP_REGIONS_LIMIT = 5;
const TOP_CATEGORIES_LIMIT = 8;

/**
 * Métricas do dashboard — todas calculadas por agregação direta no
 * banco (COUNT/GROUP BY via Prisma), sem IA e sem valores estáticos.
 * Os números devem sempre bater com uma query manual no Postgres.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [totalBusinesses, businessesWithoutWebsite, savedLeads, clients, leadStatusGroups, categoryGroups, regionGroups] =
    await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { website: null } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "cliente" } }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.business.groupBy({
        by: ["category"],
        _count: { _all: true },
        orderBy: { _count: { category: "desc" } },
        take: TOP_CATEGORIES_LIMIT,
      }),
      prisma.business.groupBy({
        by: ["city"],
        where: { website: null },
        _count: { _all: true },
        orderBy: { _count: { city: "desc" } },
        take: TOP_REGIONS_LIMIT,
      }),
    ]);

  const leadsByStatusMap = new Map(leadStatusGroups.map((group) => [group.status, group._count._all]));

  const leadsByStatus = LEAD_STATUS_ORDER.map((status) => ({
    status,
    label: LEAD_STATUS_LABELS[status],
    count: leadsByStatusMap.get(status) ?? 0,
  }));

  const conversionRate = savedLeads > 0 ? Math.round((clients / savedLeads) * 1000) / 10 : 0;

  return {
    summary: { totalBusinesses, businessesWithoutWebsite, savedLeads, clients },
    conversionRate,
    businessesByCategory: categoryGroups
      .map((group) => ({ category: group.category ?? "Sem categoria", count: group._count._all }))
      .sort((a, b) => b.count - a.count),
    leadsByStatus,
    topRegionsByOpportunity: regionGroups
      .map((group) => ({ city: group.city ?? "Cidade não informada", count: group._count._all }))
      .sort((a, b) => b.count - a.count),
  };
}
