// LED Resistor Calculator - CircuitSchematic Component
// Responsibility: Renders the animated SVG circuit diagram (battery → resistor → LED).
// Receives pre-formatted label strings and a `valid` flag as props.
// Contains ZERO calculation logic. Pure SVG presentation only.

export default function CircuitSchematic({ vsLabel, vfLabel, ifLabel, rLabel, valid }) {
  const wire   = valid ? "#fbbf24" : "#334155";
  const glow   = valid ? "url(#schematic-glow)" : "none";
  const ledFill = valid ? "#fbbf24" : "#1e293b";

  return (
    <figure className="w-full" aria-label="LED series resistor circuit diagram">
      <svg
        viewBox="0 0 440 230"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        <defs>
          {/* Grid background */}
          <pattern id="sch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.6" />
          </pattern>

          {/* Amber glow filter */}
          <filter id="schematic-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Current-direction arrowhead */}
          <marker id="sch-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Grid background */}
        <rect width="440" height="230" fill="url(#sch-grid)" />

        {/* ── Wires ────────────────────────────────────────────────────────── */}
        {/* Top wire */}
        <line x1="46" y1="44" x2="394" y2="44" stroke={wire} strokeWidth="2.5" filter={glow} />
        {/* Bottom wire */}
        <line x1="46" y1="186" x2="394" y2="186" stroke={wire} strokeWidth="2.5" filter={glow} />
        {/* Left vertical (battery side) */}
        <line x1="46" y1="44"  x2="46" y2="76"  stroke={wire} strokeWidth="2.5" filter={glow} />
        <line x1="46" y1="154" x2="46" y2="186" stroke={wire} strokeWidth="2.5" filter={glow} />
        {/* Right vertical (LED side) */}
        <line x1="394" y1="44"  x2="394" y2="84"  stroke={wire} strokeWidth="2.5" filter={glow} />
        <line x1="394" y1="144" x2="394" y2="186" stroke={wire} strokeWidth="2.5" filter={glow} />

        {/* Current direction arrow on top wire */}
        {valid && (
          <line
            x1="205" y1="44" x2="235" y2="44"
            stroke="#fbbf24" strokeWidth="2.5"
            markerEnd="url(#sch-arrow)"
            filter={glow}
          />
        )}

        {/* ── Battery (left) ───────────────────────────────────────────────── */}
        {/* Three cell pairs */}
        {[76, 100, 124].map((y, i) => (
          <g key={i}>
            <line x1="30" y1={y}    x2="62" y2={y}    stroke={wire} strokeWidth="3" />
            <line x1="36" y1={y+14} x2="56" y2={y+14} stroke={wire} strokeWidth="1.5" />
          </g>
        ))}

        {/* Battery label — Vs */}
        <text x="16" y="117" fill="#fbbf24" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          {vsLabel}
        </text>
        <text x="68" y="107" fill="#64748b" fontSize="10" fontFamily="monospace">+</text>
        <text x="68" y="140" fill="#64748b" fontSize="10" fontFamily="monospace">−</text>

        {/* ── Resistor (top, center) ───────────────────────────────────────── */}
        {/* Zigzag body */}
        {(() => {
          const sx = 158, sy = 36;
          const pts = [
            [sx,      sy],
            [sx+10,   sy-10],
            [sx+20,   sy+10],
            [sx+30,   sy-10],
            [sx+40,   sy+10],
            [sx+50,   sy-10],
            [sx+60,   sy+10],
            [sx+70,   sy-10],
            [sx+80,   sy],
          ].map(([x, y]) => `${x},${y}`).join(" ");

          return (
            <>
              <rect x={sx-2} y={sy-14} width={84} height={28} rx="2"
                    fill="#0f172a" stroke={wire} strokeWidth="1" opacity="0.5" />
              <polyline
                points={pts}
                fill="none"
                stroke={wire}
                strokeWidth="2.5"
                strokeLinejoin="round"
                filter={glow}
              />
            </>
          );
        })()}

        {/* Resistor label */}
        <text x="198" y="22" fill="#fbbf24" fontSize="12" fontWeight="bold"
              fontFamily="monospace" textAnchor="middle">
          {rLabel}
        </text>
        <text x="198" y="64" fill="#475569" fontSize="9"
              fontFamily="monospace" textAnchor="middle">
          {ifLabel}
        </text>

        {/* ── LED (right) ──────────────────────────────────────────────────── */}
        {/* Triangle body */}
        <polygon
          points="394,84 376,108 412,108"
          fill={ledFill}
          stroke={wire}
          strokeWidth="2"
          strokeLinejoin="round"
          filter={valid ? glow : "none"}
        />
        {/* Cathode bar */}
        <line x1="412" y1="84" x2="412" y2="108" stroke={wire} strokeWidth="2.5" />
        {/* Connect triangle tip to wire */}
        <line x1="394" y1="108" x2="394" y2="144" stroke={wire} strokeWidth="2.5" filter={glow} />

        {/* Light rays when valid */}
        {valid && (
          <>
            <line x1="416" y1="88"  x2="428" y2="79"  stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" filter={glow} />
            <line x1="419" y1="96"  x2="433" y2="91"  stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" filter={glow} />
            <line x1="419" y1="104" x2="433" y2="104" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"  filter={glow} />
          </>
        )}

        {/* LED labels */}
        <text x="394" y="166" fill="#fbbf24" fontSize="12" fontWeight="bold"
              fontFamily="monospace" textAnchor="middle">
          LED
        </text>
        <text x="394" y="178" fill="#475569" fontSize="9"
              fontFamily="monospace" textAnchor="middle">
          {vfLabel}
        </text>
      </svg>
    </figure>
  );
}