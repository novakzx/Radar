import { Globe2, MapPinned, ShieldCheck, Sparkles, Kanban, BarChart3 } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-24">
      <ScrollReveal>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          O problema
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Muitas empresas locais ainda não têm presença digital identificável — e isso é uma
          oportunidade comercial real.
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          O AreaVon nunca afirma que uma empresa &quot;não tem site&quot; — a ausência do
          dado numa fonte pública não prova a ausência real. Por isso falamos sempre em{" "}
          <span className="text-foreground">
            &quot;website não encontrado na fonte consultada&quot;
          </span>
          , com transparência total sobre de onde vem cada informação.
        </p>
      </ScrollReveal>
    </section>
  );
}

const STEPS = [
  {
    icon: MapPinned,
    title: "Pesquise uma região",
    description:
      "Localização, raio e categoria ou palavra-chave — aceita qualquer lugar pesquisável, sem hardcode de região.",
  },
  {
    icon: Globe2,
    title: "Verificação determinística",
    description:
      "OpenStreetMap (e opcionalmente Google Places) são consultados por código — regras fixas, nunca IA.",
  },
  {
    icon: Sparkles,
    title: "Lead Score transparente",
    description:
      "Pontuação 0–100 com breakdown visível de cada critério que contribuiu, sempre reproduzível.",
  },
  {
    icon: Kanban,
    title: "CRM em kanban",
    description:
      "Salve leads, mova entre estágios e exporte em CSV/Excel quando estiver pronto para agir.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-24">
      <ScrollReveal>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Como funciona
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Do radar ao lead fechado, em quatro passos auditáveis.
        </h2>
      </ScrollReveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 0.08}>
            <div className="h-full rounded-xl border border-border bg-card p-6">
              <step.icon className="size-6 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-24">
      <div className="grid gap-8 sm:grid-cols-2">
        <ScrollReveal>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 shrink-0 text-status-success" />
            <div>
              <h3 className="font-semibold">Zero IA, 100% auditável</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Toda descoberta, deduplicação, verificação de website e pontuação são código
                determinístico — mesma entrada, mesma saída, sempre.
              </p>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-1 size-6 shrink-0 text-foreground" />
            <div>
              <h3 className="font-semibold">Métricas reais, sem enfeite</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dashboard com números que sempre batem com o banco de dados: empresas
                encontradas, oportunidades por região, conversão de leads.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
