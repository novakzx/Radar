import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PeriodicReportData } from "@/types/team";

const STAT_LABELS: { key: keyof PeriodicReportData; label: string }[] = [
  { key: "businessesFound", label: "Empresas encontradas" },
  { key: "leadsCreated", label: "Leads criados" },
  { key: "leadsWonAsClient", label: "Viraram clientes" },
  { key: "searchesRun", label: "Buscas realizadas" },
];

export function PeriodicReport({ report }: { report: PeriodicReportData }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Link
          href="/equipe?periodo=day"
          className={cn(
            "rounded-md border border-border px-3 py-1 text-xs",
            report.period === "day" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          Hoje
        </Link>
        <Link
          href="/equipe?periodo=week"
          className={cn(
            "rounded-md border border-border px-3 py-1 text-xs",
            report.period === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          Últimos 7 dias
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STAT_LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-md border border-border p-3">
            <p className="text-2xl font-semibold tracking-tight">{report[key] as number}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Período: {new Date(report.rangeStart).toLocaleString("pt-BR")} até{" "}
        {new Date(report.rangeEnd).toLocaleString("pt-BR")}. Calculado ao vivo a partir do banco —
        sem envio automático por e-mail (exigiria um serviço de e-mail configurado).
      </p>
    </div>
  );
}
