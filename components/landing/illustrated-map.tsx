const DOTS = [
  { x: 90, y: 70, found: false, delay: "0s" },
  { x: 180, y: 110, found: false, delay: "0.3s" },
  { x: 260, y: 60, found: true, delay: "0.6s" },
  { x: 340, y: 130, found: false, delay: "0.9s" },
  { x: 420, y: 80, found: false, delay: "1.2s" },
  { x: 150, y: 170, found: false, delay: "1.5s" },
  { x: 300, y: 190, found: true, delay: "1.8s" },
  { x: 480, y: 150, found: false, delay: "2.1s" },
];

/**
 * Mapa meramente ilustrativo (não é o Mapbox real usado no Radar) —
 * apenas para compor visualmente o hero. Animação 100% CSS
 * (`@keyframes` + `animation-delay`), sem JavaScript, e desligada via
 * `@media (prefers-reduced-motion: reduce)` mantendo o visual estático.
 */
export function IllustratedMap() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <svg viewBox="0 0 560 260" className="h-auto w-full" role="img" aria-label="Ilustração de mapa com empresas encontradas">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="560" height="260" fill="url(#grid)" className="text-foreground" />

        <path
          d="M40 190 Q 120 140 200 175 T 360 165 T 520 185"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2"
          className="text-foreground"
        />

        {DOTS.map((dot, index) => (
          <g key={index}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r="14"
              className={dot.found ? "fill-status-success/20" : "fill-status-error/20"}
              style={{ animation: `map-pulse 2.4s ease-out infinite`, animationDelay: dot.delay }}
            />
            <circle
              cx={dot.x}
              cy={dot.y}
              r="4.5"
              className={dot.found ? "fill-status-success" : "fill-status-error"}
            />
          </g>
        ))}
      </svg>

      <style>{`
        @keyframes map-pulse {
          0% { r: 4.5; opacity: 0.6; }
          100% { r: 22; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg circle[style] { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}
