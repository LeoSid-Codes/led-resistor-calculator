// LED Resistor Calculator - ColorCodeDisplay Component
// Responsibility: Renders the 4-band resistor color code SVG visualization and
// the color name legend below it. Receives pre-computed band data as props.
// Contains ZERO math logic — all band derivation happens in utils/colorCode.js.

import { ChevronRight } from "lucide-react";

// ── SVG resistor body with 4 color bands ─────────────────────────────────────
function ResistorSVG({ band1, band2, band3, band4 }) {
  return (
    <svg
      viewBox="0 0 220 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-65"
      aria-label="Resistor color band diagram"
    >
      {/* Lead wires */}
      <line x1="0"   y1="32" x2="34"  y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <line x1="186" y1="32" x2="220" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

      {/* Body */}
      <rect x="34" y="10" width="152" height="44" rx="22" fill="#e8d5a3" />
      <rect x="34" y="10" width="152" height="44" rx="22" fill="none" stroke="#c9b06a" strokeWidth="1.5" />

      {/* Subtle body highlight */}
      <rect x="38" y="13" width="144" height="12" rx="10" fill="white" opacity="0.2" />

      {/* Band 1 */}
      <rect x="56"  y="10" width="16" height="44" rx="1" fill={band1.hex} />

      {/* Band 2 */}
      <rect x="80"  y="10" width="16" height="44" rx="1" fill={band2.hex} />

      {/* Band 3 (multiplier) */}
      <rect x="104" y="10" width="16" height="44" rx="1" fill={band3.hex} />

      {/* Band 4 (tolerance) — spaced further right */}
      <rect x="142" y="10" width="16" height="44" rx="1" fill={band4.hex} />
    </svg>
  );
}

// ── Color swatch label ────────────────────────────────────────────────────────
function BandLabel({ band, label }) {
  const needsDarkText = ["#F5F5F5", "#FFD700", "#CFB53B", "#FF8C00"].includes(band.hex);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-full rounded px-1.5 py-1 text-center text-[0.6rem] font-bold uppercase tracking-wide"
        style={{
          background: band.hex,
          color: needsDarkText ? "#111" : "#fff",
          border: "1px solid rgba(0,0,0,0.25)",
        }}
      >
        {band.name}
      </div>
      <span className="text-[0.6rem] text-slate-600">{label}</span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ColorCodeDisplay({ bands, e24Label }) {
  if (!bands) return null;

  const { band1, band2, band3, band4 } = bands;

  return (
    <section className="flex flex-col gap-3">

      {/* Section header */}
      <header className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
        <ChevronRight size={11} />
        Color Code · {e24Label} ±5%
      </header>

      {/* Resistor SVG */}
      <div className="flex justify-center">
        <ResistorSVG band1={band1} band2={band2} band3={band3} band4={band4} />
      </div>

      {/* Band legend */}
      <div className="grid grid-cols-4 gap-2">
        <BandLabel band={band1} label="Digit 1" />
        <BandLabel band={band2} label="Digit 2" />
        <BandLabel band={band3} label="×Mult" />
        <BandLabel band={band4} label="Tolerance" />
      </div>
    </section>
  );
}