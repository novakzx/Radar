import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { MagneticButton } from "@/components/landing/magnetic-button";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-32 text-center">
      <ScrollReveal>
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Comece a prospectar com dados reais hoje.
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.15}>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Gratuito para começar. Sem necessidade de cartão de crédito.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.3}>
        <div className="mt-8 flex justify-center">
          <MagneticButton
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Criar conta grátis
          </MagneticButton>
        </div>
      </ScrollReveal>
    </section>
  );
}
