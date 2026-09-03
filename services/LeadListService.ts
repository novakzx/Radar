import "server-only";
import { prisma } from "@/lib/prisma";
import { toBusinessListItem } from "@/services/BusinessService";
import { getLeadIdsForBusinesses } from "@/services/LeadService";
import type { BusinessListItem } from "@/types/business";

export { toBusinessListItem };

export async function getBusinessListItem(businessId: string): Promise<BusinessListItem | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { sources: true },
  });
  if (!business) return null;
  return toBusinessListItem(business);
}

/** Resultados de uma busca já processada, prontos para exibição (lista/mapa). */
export async function getSearchResultItems(searchId: string): Promise<BusinessListItem[]> {
  const results = await prisma.searchResult.findMany({
    where: { searchId },
    include: { business: { include: { sources: true } } },
    orderBy: { id: "asc" },
  });

  const leadIdByBusiness = await getLeadIdsForBusinesses(results.map((r) => r.business.id));

  return results
    .map((result) => ({
      ...toBusinessListItem(result.business),
      leadId: leadIdByBusiness.get(result.business.id) ?? null,
    }))
    .sort((a, b) => b.leadScore.total - a.leadScore.total);
}
