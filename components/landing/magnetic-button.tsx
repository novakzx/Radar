"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

const MAGNETIC_STRENGTH = 0.35;

/**
 * Botão "magnético": segue sutilmente o cursor dentro da sua área.
 * Framer Motion (seção 3 — GSAP é reservado só para o scroll
 * storytelling). Desliga o efeito por completo com
 * prefers-reduced-motion, mantendo o botão 100% funcional.
 */
export function MagneticButton({ children, className, href }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  function handleMouseMove(event: React.MouseEvent<HTMLAnchorElement>) {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * MAGNETIC_STRENGTH);
    y.set((event.clientY - rect.top - rect.height / 2) * MAGNETIC_STRENGTH);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={prefersReducedMotion ? undefined : { x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
