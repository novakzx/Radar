import "server-only";
import { prisma } from "@/lib/prisma";
import { mapWithConcurrency } from "@/lib/concurrency";
import { geocodeLocation } from "@/services/GeocodingService";
import {
  fetchBusinessesFromOverpass,
  mapOverpassElementToIncomingBusiness,
} from "@/services/PlacesService";
import {
  fetchBusinessesFromGooglePlaces,
  isGooglePlacesConfigured,
} from "@/services/GooglePlacesService";
import { upsertBusinessFromSource } from "@/services/BusinessService";
import { logAuditEvent } from "@/services/AuditLogService";
import {
  SEARCH_STEPS,
  type CreateSearchInput,
  type SearchProgress,
  type SearchStepKey,
} from "@/types/search";

function initialProgress(): SearchProgress {
  return {
    geocoding: "pending",
    fetching: "pending",
    verifying_websites: "pending",
    scoring: "pending",
  };
}

/** Cria a linha de busca (status inicial: queued) — não processa nada ainda. */
export async function createSearch(input: CreateSearchInput) {
  return prisma.search.create({
    data: {
      userId: input.userId,
      location: input.location,
      radiusKm: input.radiusKm,
      category: input.category || null,
      keyword: input.keyword || null,
      status: "queued",
      step: "geocoding",
      progress: initialProgress(),
    },
  });
}

async function updateProgress(
  searchId: string,
  step: SearchStepKey,
  stepStatus: SearchProgress[SearchStepKey],
  extra: { status?: "running" | "done" | "error"; finishedAt?: Date } = {},
) {
  const current = await prisma.search.findUniqueOrThrow({ where: { id: searchId } });
  const progress = { ...(current.progress as unknown as SearchProgress), [step]: stepStatus };

  await prisma.search.update({
    where: { id: searchId },
    data: {
      step,
      progress,
      ...(extra.status ? { status: extra.status } : {}),
      ...(extra.finishedAt ? { finishedAt: extra.finishedAt } : {}),
    },
  });
}

/**
 * Executa o pipeline completo de uma busca (seção 8): geocoding ->
 * fetching -> verifying_websites -> scoring. Pensado para rodar em
 * background via `after()` a partir de uma Server Action/Route
 * Handler, atualizando o progresso real a cada etapa concluída — o
 * client faz polling e nunca vê um tempo de espera simulado.
 */
export async function runSearchPipeline(searchId: string): Promise<void> {
  let currentStep: SearchStepKey = "geocoding";

  try {
    const search = await prisma.search.findUniqueOrThrow({ where: { id: searchId } });
    await prisma.search.update({ where: { id: searchId }, data: { status: "running" } });

    // 1) Geocoding
    currentStep = "geocoding";
    await updateProgress(searchId, "geocoding", "running");
    const geo = await geocodeLocation(search.location);
    if (!geo) {
      await updateProgress(searchId, "geocoding", "error", {
        status: "error",
        finishedAt: new Date(),
      });
      return;
    }
    await updateProgress(searchId, "geocoding", "done");

    // 2) Fetching (Overpass + Google Places opcional)
    currentStep = "fetching";
    await updateProgress(searchId, "fetching", "running");
    const radiusMeters = search.radiusKm * 1000;

    const overpassElements = await fetchBusinessesFromOverpass({
      lat: geo.lat,
      lng: geo.lng,
      radiusMeters,
      category: search.category,
      keyword: search.keyword,
    });

    const incomingBusinesses = overpassElements
      .map(mapOverpassElementToIncomingBusiness)
      .filter((business) => business !== null);

    if (isGooglePlacesConfigured()) {
      const googleResults = await fetchBusinessesFromGooglePlaces({
        lat: geo.lat,
        lng: geo.lng,
        radiusMeters,
        keyword: search.keyword || search.category || "",
      }).catch((error) => {
        console.error("[SearchService] Google Places falhou, seguindo só com OSM", error);
        return [];
      });
      incomingBusinesses.push(...googleResults);
    }

    // Persistência paralelizada (concorrência limitada) — a maior parte
    // do tempo é round-trip de rede até o Postgres, então processar
    // várias empresas ao mesmo tempo evita esperar dezenas delas em
    // série sem sobrecarregar a conexão.
    const businessIds = await mapWithConcurrency(incomingBusinesses, 8, async (incoming) => {
      const { businessId } = await upsertBusinessFromSource(incoming);
      await prisma.searchResult.upsert({
        where: { searchId_businessId: { searchId, businessId } },
        update: {},
        create: { searchId, businessId },
      });
      return businessId;
    });
    await updateProgress(searchId, "fetching", "done");

    // 3) Verificação de website — já computada durante o upsert
    // (BusinessService.recomputeWebsiteStatus), de forma determinística
    // a partir de todas as fontes persistidas para cada empresa.
    currentStep = "verifying_websites";
    await updateProgress(searchId, "verifying_websites", "running");
    await updateProgress(searchId, "verifying_websites", "done");

    // 4) Scoring — o Lead Score é sempre calculado on-demand na
    // leitura (LeadScoringService), nunca armazenado como valor
    // estático, para refletir sempre o estado atual dos dados.
    currentStep = "scoring";
    await updateProgress(searchId, "scoring", "running");
    await updateProgress(searchId, "scoring", "done", {
      status: "done",
      finishedAt: new Date(),
    });

    await logAuditEvent({
      userId: search.userId,
      action: "search.completed",
      entity: "search",
      entityId: searchId,
      metadata: { businessCount: businessIds.length },
    });
  } catch (error) {
    console.error(`[SearchService] pipeline falhou na etapa "${currentStep}"`, error);
    await updateProgress(searchId, currentStep, "error", {
      status: "error",
      finishedAt: new Date(),
    }).catch(() => {
      // Última tentativa, mesmo sem saber o progresso exato: garante
      // que a busca nunca fique "running" para sempre na UI.
      return prisma.search
        .update({ where: { id: searchId }, data: { status: "error", finishedAt: new Date() } })
        .catch(() => {});
    });
  }
}

export { SEARCH_STEPS };
