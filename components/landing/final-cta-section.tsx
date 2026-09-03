import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { MagneticButton } from "@/components/landing/magnetic-button";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-32 text-center">
      <ScrollReveal>
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Prospecção com dados reais.
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.3}>
        <div className="mt-8 flex justify-center">
          <MagneticButton
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-signal-blue px-8 text-sm font-semibold text-white shadow-[0_0_30px_-4px_rgba(0,122,252,0.6)] transition-colors hover:bg-deep-signal"
          >
            Entrar
          </MagneticButton>
        </div>
      </ScrollReveal>
    </section>
  );
}
