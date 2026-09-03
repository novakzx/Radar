export type WebsiteConfidence = "alta" | "media" | "baixa";
export type LeadClassification = "alto" | "medio" | "baixo";
export type BusinessSourceKind = "osm" | "google_places";

export interface ScoreReason {
  key: string;
  label: string;
  points: number;
}

export interface LeadScoreResult {
  total: number;
  breakdown: ScoreReason[];
  classification: LeadClassification;
}

export interface LeadScoringInput {
  websiteFound: boolean;
  phone?: string | null;
  hasSocialMedia: boolean;
  reviewCount?: number | null;
  rating?: number | null;
  isIndependent?: boolean | null;
}

export interface SourceWebsiteSignal {
  source: BusinessSourceKind;
  website?: string | null;
  socialMediaUrl?: string | null;
}

export interface WebsiteVerificationResult {
  found: boolean;
  website: string | null;
  confidence: WebsiteConfidence;
  hasSocialMedia: boolean;
}

/** DTO de exibição (card/lista/mapa/detalhe) — seguro para uso no client. */
export interface BusinessListItem {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  isIndependent: boolean | null;
  websiteVerification: WebsiteVerificationResult;
  leadScore: LeadScoreResult;
  lastVerifiedAt: string | null;
  sourcesConsulted: string[];
  /** Preenchido quando já existe um lead salvo para esta empresa (Fase 3). */
  leadId?: string | null;
}
