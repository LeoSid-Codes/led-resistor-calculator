// LED Resistor Calculator - ResultsPanel Component
// Responsibility: Displays all calculated results and the copy-to-clipboard button.
// Receives pre-computed values as props. Contains ZERO math logic.

import { useState, useCallback } from "react";
import { Copy, Check, AlertTriangle, ChevronRight, Calculator } from "lucide-react";

// ── Sub-component: a single result row ───────────────────────────────────────
function ResultRow({ label, value, unit, accent, warning }) {
  return (
    <div className="flex items-baseline justify-between border-b border-slate-800 py-2.5">
      <span className="text-[0.72rem] uppercase tracking-wider text-slate-500">{label}</span>
      <span
        className={[
          "font-mono",
          accent  ? "text-xl font-bold text-amber-400" : "text-base text-slate-200",
          warning ? "text-red-400" : "",
        ].join(" ")}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[0.72rem] text-slate-500">{unit}</span>
        )}
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ResultsPanel({
  canCalc,
  exactResistance,
  e24Resistance,
  e24Label,
  powerMw,
  actualCurrentMa,
  voltageDropR,
  voltageWarning,
  // For clipboard — raw numeric inputs passed in so copy text is human-readable
  vsNum,
  vfNum,
  ifNum,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = [
      "── LED Series Resistor Calculator Results ──",
      `Source Voltage (Vs):       ${vsNum} V`,
      `LED Forward Voltage (Vf):  ${vfNum} V`,
      `LED Current (If):          ${ifNum} mA`,
      `Calculated Resistance:     ${exactResistance?.toFixed(2)} Ω`,
      `Nearest E24 Value:         ${e24Label}`,
      `Power Dissipation:         ${powerMw?.toFixed(2)} mW`,
      `Actual LED Current:        ${actualCurrentMa?.toFixed(2)} mA`,
      `Voltage Drop (R):          ${voltageDropR?.toFixed(2)} V`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [vsNum, vfNum, ifNum, exactResistance, e24Label, powerMw, actualCurrentMa, voltageDropR]);

  // Empty state
  if (!canCalc) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 py-10 text-slate-600">
        <Calculator size={32} strokeWidth={1.2} />
        <p className="text-[0.78rem]">
          {voltageWarning ? "Fix voltage error to see results" : "Enter all three values to calculate"}
        </p>
      </section>
    );
  }

  const highPower = powerMw > 250;

  return (
    <section className="flex flex-col gap-1">

      {/* Section header */}
      <header className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
        <ChevronRight size={11} />
        Calculated Results
      </header>

      {/* Result rows */}
      <ResultRow label="Exact Resistance"   value={`${exactResistance.toFixed(2)}`} unit="Ω" />
      <ResultRow label="E24 Standard Value" value={e24Label}   accent />
      <ResultRow
        label="Power Dissipation"
        value={powerMw.toFixed(2)}
        unit="mW"
        warning={highPower}
      />
      <ResultRow label="Actual LED Current" value={actualCurrentMa.toFixed(2)} unit="mA" />
      <ResultRow label="Voltage Drop (R)"   value={voltageDropR.toFixed(2)}    unit="V"  />

      {/* High-power warning */}
      {highPower && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-950/20 px-3 py-2.5">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-[0.7rem] leading-relaxed text-amber-300">
            Power exceeds 250 mW — use a <strong>½W or 1W</strong> rated resistor to prevent overheating.
          </p>
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={[
          "mt-4 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5",
          "font-mono text-[0.75rem] uppercase tracking-widest transition-all duration-200",
          copied
            ? "border-emerald-600 bg-emerald-950/40 text-emerald-400"
            : "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:border-amber-400 hover:bg-amber-500/20",
        ].join(" ")}
      >
        {copied ? (
          <><Check size={13} /> Copied!</>
        ) : (
          <><Copy size={13} /> Copy Results</>
        )}
      </button>
    </section>
  );
}
