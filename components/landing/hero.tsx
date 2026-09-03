"use client";

import { motion } from "framer-motion";
import { MagneticButton } from "@/components/landing/magnetic-button";
import { IllustratedMap } from "@/components/landing/illustrated-map";

const HEADLINE_LINES = [
  "Encontre empresas com",
  "website não encontrado",
  "na fonte consultada.",
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const line = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-4 py-16 text-center sm:min-h-screen sm:gap-10 sm:px-6 sm:py-24">
      <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        CodeVision Radar
      </span>

      <motion.h1
        initial="hidden"
        animate="visible"
        variants={container}
        className="max-w-3xl text-[1.65rem] leading-tight font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1] md:text-6xl"
      >
        {HEADLINE_LINES.map((text) => (
          <span key={text} className="block overflow-hidden pb-1">
            <motion.span variants={line} className="block">
              {text}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="max-w-xl text-balance text-muted-foreground"
      >
        Prospecção comercial 100% determinística — sem IA. Pesquise uma região, descubra
        oportunidades reais e priorize leads com um Lead Score transparente e auditável.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <MagneticButton
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Criar conta grátis
        </MagneticButton>
        <MagneticButton
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
        >
          Entrar
        </MagneticButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="mt-4 w-full max-w-3xl"
      >
        <IllustratedMap />
      </motion.div>
    </section>
  );
}
