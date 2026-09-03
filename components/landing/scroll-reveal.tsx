"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Distância (px) de onde o conteúdo desliza até a posição final. */
  y?: number;
  delay?: number;
}

/**
 * Client Component isolado só para a animação de entrada ao rolar a
 * página (GSAP + ScrollTrigger, seção 3 do briefing). O conteúdo em si
 * (children) continua podendo ser renderizado no servidor.
 */
export function ScrollReveal({ children, className, y = 32, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    return () => context.revert();
  }, [y, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
