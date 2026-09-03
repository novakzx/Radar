"use client";

import { CheckCircle2, CircleDashed, CircleX, Loader2 } from "lucide-react";
import { useSearchStatus } from "@/hooks/use-search-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsView } from "@/components/shared/results-view";
import type { SearchStepKey } from "@/types/search";

const STEP_LABELS: Record<SearchStepKey, string> = {
  geocoding: "Geocodificação",
  fetching: "Buscando empresas",
  verifying_websites: "Verificando websites",
  scoring: "Calculando Lead Score",
};

const STEP_ORDER: SearchStepKey[] = ["geocoding", "fetching", "verifying_websites", "scoring"];

export function SearchProgressView({ searchId }: { searchId: string }) {
  const { data, isLoading, isError } = useSearchStatus(searchId);

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando busca...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-destructive">
        Não foi possível carregar esta busca. Tente novamente em alguns instantes.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <span>
              {data.location} · {data.category ?? data.keyword} · {data.radiusKm}km
            </span>
            <Badge
              variant={
                data.status === "done"
                  ? "secondary"
                  : data.status === "error"
                    ? "destructive"
                    : "outline"
              }
            >
              {data.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 sm:grid-cols-4">
            {STEP_ORDER.map((step) => (
              <li key={step} className="flex items-center gap-2 text-sm">
                <StepIcon status={data.progress[step]} />
                <span
                  className={
                    data.progress[step] === "done" ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {STEP_LABELS[step]}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {data.status === "error" && (
        <p className="text-sm text-destructive">
          Não foi possível concluir a pesquisa. A fonte de dados não respondeu ou a
          localização informada não foi encontrada. Tente novamente em alguns instantes.
        </p>
      )}

      {data.status === "done" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {data.results.length} empresa{data.results.length === 1 ? "" : "s"} encontrada
            {data.results.length === 1 ? "" : "s"}
          </h2>
          {data.results.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma empresa encontrada para esses critérios na fonte consultada.
            </p>
          ) : (
            <ResultsView businesses={data.results} />
          )}
        </div>
      )}
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle2 className="size-4 text-status-success" />;
  if (status === "running") return <Loader2 className="size-4 animate-spin text-foreground" />;
  if (status === "error") return <CircleX className="size-4 text-status-error" />;
  return <CircleDashed className="size-4 text-muted-foreground" />;
}
