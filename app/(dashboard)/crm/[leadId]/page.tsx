import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AtSign, ExternalLink, Phone, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { verifySession } from "@/lib/dal";
import { getLeadDetail } from "@/services/LeadService";
import { LeadStatusSelect } from "@/components/shared/lead-status-select";
import { LeadTags } from "@/components/shared/lead-tags";
import { LeadNotes } from "@/components/shared/lead-notes";
import { LeadDetailsForm } from "@/components/shared/lead-details-form";

export const metadata: Metadata = {
  title: "Lead",
  robots: { index: false, follow: false },
};

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

export default async function LeadDetailPage(props: PageProps<"/crm/[leadId]">) {
  await verifySession();
  const { leadId } = await props.params;

  const lead = await getLeadDetail(leadId);
  if (!lead) notFound();

  const { business } = lead;

  return (
    <div className="space-y-6">
      <Link
        href="/crm"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao CRM
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {business.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- domínio da foto é arbitrário
            <img
              src={business.photoUrl}
              alt={`Foto de ${business.name}`}
              className="size-20 shrink-0 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
            <p className="text-muted-foreground">
              {business.category ?? "Categoria não informada"} ·{" "}
              {[business.address, business.city].filter(Boolean).join(", ") || "Endereço não informado"}
            </p>
          </div>
        </div>
        <LeadStatusSelect leadId={lead.id} status={lead.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Verificação de website</CardTitle>
              <CardDescription>
                Fonte(s) consultada(s): {business.sourcesConsulted.join(", ")} · última verificação:{" "}
                {business.lastVerifiedAt
                  ? new Date(business.lastVerifiedAt).toLocaleString("pt-BR")
                  : "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Badge
                variant="outline"
                className={
                  business.websiteVerification.found
                    ? "border-status-success/30 bg-status-success/15 text-status-success"
                    : business.websiteVerification.confidence === "media"
                      ? "border-status-warning/30 bg-status-warning/15 text-status-warning"
                      : "border-status-error/30 bg-status-error/15 text-status-error"
                }
              >
                {business.websiteVerification.found
                  ? "Website encontrado na fonte consultada"
                  : "Website não encontrado na fonte consultada"}
              </Badge>
              <p className="text-muted-foreground">
                {CONFIDENCE_LABEL[business.websiteVerification.confidence]}
              </p>
              {business.websiteVerification.website && (
                <a
                  href={business.websiteVerification.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 underline underline-offset-2"
                >
                  <ExternalLink className="size-3.5" />
                  {business.websiteVerification.website}
                </a>
              )}
              {business.websiteVerification.socialMediaUrl && (
                <a
                  href={business.websiteVerification.socialMediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 underline underline-offset-2"
                >
                  <AtSign className="size-3.5" />
                  {business.websiteVerification.socialMediaUrl}
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Score: {business.leadScore.total}</CardTitle>
              <CardDescription>{CLASSIFICATION_LABEL[business.leadScore.classification]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${business.leadScore.total}%` }}
                />
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {business.leadScore.breakdown.map((reason) => (
                  <li key={reason.key}>
                    +{reason.points} · {reason.label}
                  </li>
                ))}
                {business.leadScore.breakdown.length === 0 && (
                  <li>Nenhum critério de pontuação atendido.</li>
                )}
              </ul>

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-4 text-sm">
                {business.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-4" />
                    {business.phone}
                  </span>
                )}
                {business.rating != null && (
                  <span className="flex items-center gap-1">
                    <Star className="size-4" />
                    {business.rating.toFixed(1)} ({business.reviewCount ?? 0} avaliações)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadNotes leadId={lead.id} notes={lead.notes} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LeadDetailsForm
                leadId={lead.id}
                potentialValue={lead.potentialValue}
                contactDate={lead.contactDate}
              />
              <Separator />
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Tags</p>
                <LeadTags leadId={lead.id} tags={lead.tags} />
              </div>
              {lead.ownerEmail && (
                <p className="text-xs text-muted-foreground">Responsável: {lead.ownerEmail}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
