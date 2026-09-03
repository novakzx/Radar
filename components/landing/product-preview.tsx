"use client";

import { motion } from "framer-motion";

const DOTS = [
  { x: 90, y: 70, found: false, delay: 0 },
  { x: 180, y: 110, found: false, delay: 0.3 },
  { x: 260, y: 60, found: true, delay: 0.6 },
  { x: 340, y: 130, found: false, delay: 0.9 },
  { x: 420, y: 80, found: false, delay: 1.2 },
  { x: 150, y: 170, found: false, delay: 1.5 },
  { x: 300, y: 190, found: true, delay: 1.8 },
  { x: 480, y: 150, found: false, delay: 2.1 },
];

const STAT_CARDS = [
  { name: "Pizzaria Bella Vista", score: 82, label: "🔥 Alto potencial" },
  { name: "Barbearia do Zé", score: 70, label: "🟡 Médio potencial" },
  { name: "Studio Fit Almada", score: 88, label: "🔥 Alto potencial" },
];

/**
 * "Vídeo apresentativo" do produto — como não há footage real do app
 * pra embutir (e baixar vídeo de terceiros é fora de cogitação), a
 * seção usa uma simulação viva do Radar: varredura em looping + cards
 * de lead flutuando, dentro de uma moldura de "chrome" de navegador que
 * deixa claro que é uma prévia do produto, não uma ilustração genérica.
 * 100% CSS/SVG/Framer Motion — sem custo de asset, sem rede.
 */
export function ProductPreview() {
  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-deep-charcoal shadow-2xl">
        {/* barra de "chrome" do navegador — assinala "isto é o produto real" */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-graphite/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 rounded-full bg-void-black/60 px-3 py-1 text-[11px] text-slate">
            areavon.app/radar
          </span>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[2/1]">
          <svg
            viewBox="0 0 560 280"
            className="h-full w-full"
            role="img"
            aria-label="Prévia animada do Radar de prospecção"
          >
            <defs>
              <pattern id="preview-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#a0aaba" strokeOpacity="0.08" />
              </pattern>
              <radialGradient id="sweep-fade" cx="0%" cy="0%" r="75%">
                <stop offset="0%" stopColor="#007afc" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#007afc" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="560" height="280" fill="url(#preview-grid)" />

            <path
              d="M40 205 Q 120 155 200 190 T 360 180 T 520 200"
              fill="none"
              stroke="#333943"
              strokeWidth="2"
            />

            {/* varredura de radar — gira em loop, revelando os pontos como um radar de verdade */}
            <g style={{ transformOrigin: "280px 140px", animation: "radar-spin 4s linear infinite" }}>
              <path d="M280 140 L280 20 A120 120 0 0 1 384 79 Z" fill="url(#sweep-fade)" />
            </g>
            <circle cx="280" cy="140" r="120" fill="none" stroke="#1c1f24" strokeWidth="1.5" />
            <circle cx="280" cy="140" r="80" fill="none" stroke="#1c1f24" strokeWidth="1.5" />
            <circle cx="280" cy="140" r="40" fill="none" stroke="#1c1f24" strokeWidth="1.5" />

            {DOTS.map((dot, index) => (
              <g key={index}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="14"
                  fill={dot.found ? "#228a56" : "#007afc"}
                  opacity="0.18"
                  style={{
                    animation: "preview-pulse 2.4s ease-out infinite",
                    animationDelay: `${dot.delay}s`,
                  }}
                />
                <circle cx={dot.x} cy={dot.y} r="4.5" fill={dot.found ? "#228a56" : "#007afc"} />
              </g>
            ))}
          </svg>

          {/* cards de lead flutuando — o "vídeo" acontece aqui, em loop */}
          <div className="pointer-events-none absolute top-4 right-4 flex flex-col gap-2 sm:top-6 sm:right-6">
            {STAT_CARDS.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: [0, 1, 1, 0], x: [16, 0, 0, -8] }}
                transition={{
                  duration: 3.6,
                  times: [0, 0.15, 0.8, 1],
                  repeat: Infinity,
                  repeatDelay: (STAT_CARDS.length - 1) * 3.6,
                  delay: index * 3.6,
                  ease: "easeOut",
                }}
                className="hidden w-48 rounded-xl border border-white/10 bg-void-black/90 p-3 text-left shadow-xl backdrop-blur sm:block"
              >
                <p className="truncate text-xs font-medium text-white">{stat.name}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-fog">Lead Score {stat.score}</span>
                  <span className="text-[11px]">{stat.label}</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-signal-blue" style={{ width: `${stat.score}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes radar-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes preview-pulse {
          0% { r: 4.5; opacity: 0.5; }
          100% { r: 24; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg g[style], svg circle[style] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
