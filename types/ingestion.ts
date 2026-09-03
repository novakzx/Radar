import type { BusinessSourceKind } from "@/types/business";

/** Forma comum de um resultado de busca vindo de qualquer fonte (OSM, Google Places). */
export interface IncomingBusiness {
  source: BusinessSourceKind;
  sourceId: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  socialMediaUrl: string | null;
  photoUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  isIndependent: boolean | null;
  rawPayload: unknown;
}
