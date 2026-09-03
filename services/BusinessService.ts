import "server-only";
import type { Business, BusinessSource, Prisma, BusinessSourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeBusinessName } from "@/lib/text";
import { haversineDistanceMeters, metersToDegreeDelta } from "@/lib/geo";
import { verifyWebsite } from "@/services/WebsiteVerificationService";
import { calculateLeadScore } from "@/services/LeadScoringService";
import { buildSocialUrl, type RawOverpassElement } from "@/services/PlacesService";
import type { IncomingBusiness } from "@/types/ingestion";
import type { BusinessListItem, SourceWebsiteSignal } from "@/types/business";

const DEFAULT_DEDUP_RADIUS_METERS = 50;

export interface UpsertResult {
  businessId: string;
  created: boolean;
}

/**
 * Persiste uma empresa vinda de uma fonte externa aplicando a
 * deduplicação da seção 5:
 *  1) mesma (source, sourceId) já existe? -> mesma empresa, atualiza.
 *  2) senão, nome normalizado + proximidade geográfica (< raio)? -> mesma empresa.
 *  3) senão, cria uma nova empresa.
 */
export async function upsertBusinessFromSource(
  incoming: IncomingBusiness,
  dedupRadiusMeters: number = DEFAULT_DEDUP_RADIUS_METERS,
): Promise<UpsertResult> {
  const existingSource = await prisma.businessSource.findUnique({
    where: {
      source_sourceId: { source: incoming.source, sourceId: incoming.sourceId },
    },
  });

  if (existingSource) {
    await prisma.businessSource.update({
      where: { id: existingSource.id },
      data: {
        rawPayload: incoming.rawPayload as Prisma.InputJsonValue,
        fetchedAt: new Date(),
      },
    });
    await applyIncomingFields(existingSource.businessId, incoming);
    await recomputeWebsiteStatus(existingSource.businessId);
    return { businessId: existingSource.businessId, created: false };
  }

  if (incoming.lat != null && incoming.lng != null) {
    const match = await findNearbyMatchByName(incoming.name, incoming.lat, incoming.lng, dedupRadiusMeters);
    if (match) {
      await prisma.businessSource.create({
        data: {
          businessId: match.id,
          source: incoming.source,
          sourceId: incoming.sourceId,
          rawPayload: incoming.rawPayload as Prisma.InputJsonValue,
        },
      });
      await applyIncomingFields(match.id, incoming);
      await recomputeWebsiteStatus(match.id);
      return { businessId: match.id, created: false };
    }
  }

  const business = await prisma.business.create({
    data: {
      name: incoming.name,
      category: incoming.category,
      address: incoming.address,
      city: incoming.city,
      lat: incoming.lat,
      lng: incoming.lng,
      phone: incoming.phone,
      website: null,
      rating: incoming.rating,
      reviewCount: incoming.reviewCount,
      isIndependent: incoming.isIndependent,
    },
  });

  await prisma.businessSource.create({
    data: {
      businessId: business.id,
      source: incoming.source,
      sourceId: incoming.sourceId,
      rawPayload: incoming.rawPayload as Prisma.InputJsonValue,
    },
  });

  await recomputeWebsiteStatus(business.id);
  return { businessId: business.id, created: true };
}

async function findNearbyMatchByName(
  name: string,
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<{ id: string } | null> {
  const normalizedTarget = normalizeBusinessName(name);
  const delta = metersToDegreeDelta(radiusMeters);

  const candidates = await prisma.business.findMany({
    where: {
      lat: { gte: lat - delta, lte: lat + delta },
      lng: { gte: lng - delta, lte: lng + delta },
    },
    select: { id: true, name: true, lat: true, lng: true },
  });

  const match = candidates.find(
    (candidate) =>
      candidate.lat != null &&
      candidate.lng != null &&
      normalizeBusinessName(candidate.name) === normalizedTarget &&
      haversineDistanceMeters(lat, lng, candidate.lat, candidate.lng) <= radiusMeters,
  );

  return match ? { id: match.id } : null;
}

/** Atualiza campos escalares sem nunca sobrescrever um valor existente com `null`. */
async function applyIncomingFields(businessId: string, incoming: IncomingBusiness): Promise<void> {
  const data: Prisma.BusinessUpdateInput = {};

  if (incoming.category) data.category = incoming.category;
  if (incoming.address) data.address = incoming.address;
  if (incoming.city) data.city = incoming.city;
  if (incoming.phone) data.phone = incoming.phone;
  if (incoming.rating != null) data.rating = incoming.rating;
  if (incoming.reviewCount != null) data.reviewCount = incoming.reviewCount;
  if (incoming.isIndependent != null) data.isIndependent = incoming.isIndependent;
  if (incoming.lat != null) data.lat = incoming.lat;
  if (incoming.lng != null) data.lng = incoming.lng;

  if (Object.keys(data).length === 0) return;

  await prisma.business.update({ where: { id: businessId }, data });
}

/**
 * Recalcula o status de website da empresa a partir de TODAS as fontes
 * já persistidas (não só a mais recente), usando o
 * WebsiteVerificationService de forma determinística.
 */
export async function recomputeWebsiteStatus(businessId: string): Promise<void> {
  const sources = await prisma.businessSource.findMany({ where: { businessId } });
  const signals = sources.map(extractWebsiteSignal);
  const result = verifyWebsite(signals);

  await prisma.business.update({
    where: { id: businessId },
    data: { website: result.website },
  });
}

export function extractWebsiteSignal(source: {
  source: BusinessSourceType;
  rawPayload: Prisma.JsonValue;
}): SourceWebsiteSignal {
  if (source.source === "osm") {
    const element = source.rawPayload as unknown as RawOverpassElement;
    const tags = element?.tags ?? {};
    return {
      source: "osm",
      website: tags.website ?? tags["contact:website"] ?? null,
      socialMediaUrl:
        buildSocialUrl(tags["contact:instagram"], "instagram.com") ??
        buildSocialUrl(tags["contact:facebook"], "facebook.com") ??
        null,
    };
  }

  if (source.source === "google_places") {
    const payload = source.rawPayload as unknown as { details?: { website?: string } };
    return {
      source: "google_places",
      website: payload?.details?.website ?? null,
      socialMediaUrl: null,
    };
  }

  return { source: source.source, website: null, socialMediaUrl: null };
}

export type BusinessWithSources = Business & { sources: BusinessSource[] };

/**
 * Monta o DTO de exibição (card/lista/mapa/detalhe/kanban) a partir de
 * uma empresa + suas fontes — composição de WebsiteVerificationService
 * + LeadScoringService, ambos determinísticos.
 */
export function toBusinessListItem(business: BusinessWithSources): BusinessListItem {
  const signals = business.sources.map(extractWebsiteSignal);
  const websiteVerification = verifyWebsite(signals);

  const leadScore = calculateLeadScore({
    websiteFound: websiteVerification.found,
    phone: business.phone,
    hasSocialMedia: websiteVerification.hasSocialMedia,
    reviewCount: business.reviewCount,
    rating: business.rating,
    isIndependent: business.isIndependent,
  });

  const lastVerifiedAt = business.sources.reduce<Date | null>((latest, source) => {
    if (!latest || source.fetchedAt > latest) return source.fetchedAt;
    return latest;
  }, null);

  const sourcesConsulted = Array.from(new Set(business.sources.map((s) => s.source)));

  return {
    id: business.id,
    name: business.name,
    category: business.category,
    address: business.address,
    city: business.city,
    lat: business.lat,
    lng: business.lng,
    phone: business.phone,
    rating: business.rating,
    reviewCount: business.reviewCount,
    isIndependent: business.isIndependent,
    websiteVerification,
    leadScore,
    lastVerifiedAt: lastVerifiedAt ? lastVerifiedAt.toISOString() : null,
    sourcesConsulted,
  };
}
