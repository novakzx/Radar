import { AtSign, ExternalLink, Phone, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SaveLeadButton } from "@/components/shared/save-lead-button";
import type { BusinessListItem } from "@/types/business";

const CONFIDENCE_LABEL: Record<string, string> = {
  alta: "Alta confiança",
  media: "Média confiança",
  baixa: "Baixa confiança",
};

const CLASSIFICATION_LABEL: Record<string, string> = {
  alto: "🔥 Alto potencial",
  medio: "🟡 Médio potencial",
  baixo: "⚪ Baixo potencial",
};

const SOURCE_LABEL: Record<string, string> = {
  osm: "OpenStreetMap",
  google_places: "Google Places",
};

export function BusinessResultCard({ business }: { business: BusinessListItem }) {
  const { websiteVerification, leadScore } = business;

  const websiteBadgeClass = websiteVerification.found
    ? "border-status-success/30 bg-status-success/15 text-status-success"
    : websiteVerification.confidence === "media"
      ? "border-status-warning/30 bg-status-warning/15 text-status-warning"
      : "border-status-error/30 bg-status-error/15 text-status-error";

  return (
    <Card>
      {business.photoUrl && (
        // URL de foto vem de fontes externas arbitrárias (OSM/Wikimedia/proxy do Google);
        // next/image exigiria permitir esses domínios previamente, o que não é viável aqui.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={business.photoUrl}
          alt={`Foto de ${business.name}`}
          className="h-32 w-full rounded-t-xl object-cover"
          loading="lazy"
        />
      )}
      <CardHeader>
        <CardTitle className="text-base">{business.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {business.category ?? "Categoria não informada"} ·{" "}
          {business.city ?? business.address ?? "Endereço não informado"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={websiteBadgeClass}>
            {websiteVerification.found
              ? "Website encontrado na fonte consultada"
              : "Website não encontrado na fonte consultada"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {CONFIDENCE_LABEL[websiteVerification.confidence]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Lead Score: {leadScore.total}</span>
          <span>{CLASSIFICATION_LABEL[leadScore.classification]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${leadScore.total}%` }}
          />
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {leadScore.breakdown.map((reason) => (
            <li key={reason.key}>
              +{reason.points} · {reason.label}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
          {business.phone && (
            <span className="flex items-center gap-1">
              <Phone className="size-3" />
              {business.phone}
            </span>
          )}
          {business.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="size-3" />
              {business.rating.toFixed(1)} ({business.reviewCount ?? 0})
            </span>
          )}
          {websiteVerification.website && (
            <a
              href={websiteVerification.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 underline underline-offset-2"
            >
              <ExternalLink className="size-3" />
              site
            </a>
          )}
          {websiteVerification.socialMediaUrl && (
            <a
              href={websiteVerification.socialMediaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 underline underline-offset-2"
            >
              <AtSign className="size-3" />
              rede social
            </a>
          )}
        </div>

        <p className="pt-1 text-[11px] text-muted-foreground">
          Fonte(s) consultada(s): {business.sourcesConsulted.map((s) => SOURCE_LABEL[s] ?? s).join(", ")}
          {" · "}
          última verificação:{" "}
          {business.lastVerifiedAt
            ? new Date(business.lastVerifiedAt).toLocaleString("pt-BR")
            : "—"}
        </p>

        <div onClick={(event) => event.stopPropagation()}>
          <SaveLeadButton businessId={business.id} leadId={business.leadId} />
        </div>
      </CardContent>
    </Card>
  );
}
