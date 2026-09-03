import type { Metadata } from "next";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { Hero } from "@/components/landing/hero";
import { ProblemSection, HowItWorksSection, TrustSection } from "@/components/landing/story-sections";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "CodeVision Radar",
  description:
    "Prospecção comercial determinística, sem IA: encontre empresas com website não encontrado na fonte consultada e priorize leads com um Lead Score transparente.",
  openGraph: {
    title: "CodeVision Radar",
    description:
      "Prospecção comercial determinística, sem IA: encontre empresas com website não encontrado na fonte consultada.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorksSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </SmoothScrollProvider>
  );
}
