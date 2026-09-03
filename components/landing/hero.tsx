"use client";

import { motion } from "framer-motion";
import { MagneticButton } from "@/components/landing/magnetic-button";
import { ProductPreview } from "@/components/landing/product-preview";

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
    <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-4 py-20 text-center sm:min-h-screen sm:gap-10 sm:px-6 sm:py-28">
      {/* Único acento cromático do site (azul) — nunca misturar com outra cor decorativa. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="animate-drift absolute top-[-8%] left-[8%] size-80 rounded-full bg-signal-blue/25 blur-[110px] sm:size-[28rem]" />
        <div className="animate-drift-slow absolute top-[15%] right-[5%] size-72 rounded-full bg-signal-blue/10 blur-[120px] sm:size-[26rem]" />
      </div>

      <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate">AreaVon</span>

      <motion.h1
        initial="hidden"
        animate="visible"
        variants={container}
        className="max-w-4xl text-[2.1rem] leading-[1.05] font-bold tracking-[-0.02em] text-balance text-white sm:text-6xl sm:leading-[1.02] md:text-[4.25rem]"
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
        className="max-w-xl text-balance text-base text-fog sm:text-lg"
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
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-signal-blue px-7 text-sm font-semibold text-white shadow-[0_0_30px_-4px_rgba(0,122,252,0.6)] transition-colors hover:bg-deep-signal"
        >
          Entrar
        </MagneticButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="[--fade-shadow:0_-160px_160px_-70px_#0e1012_inset] mt-4 w-full max-w-4xl shadow-(--fade-shadow)"
      >
        <ProductPreview />
      </motion.div>
    </section>
  );
}
