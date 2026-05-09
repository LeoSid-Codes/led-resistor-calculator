// LED Resistor Calculator - App Root
// Responsibility: State management, orchestration, and layout only.
// Calls utils for all math. Passes computed props to components.
// Contains ZERO calculation logic and ZERO inline styles.

import { useState, useMemo, useCallback } from "react";
import { Zap } from "lucide-react";

// ── Utilities (pure math / data) ──────────────────────────────────────────────
import {
  validateInputs,
  calculateResistance,
  calculatePower,
  calculateActualCurrent,
  findNearestE24,
  formatResistance,
} from "./utils/calculations";
import { getColorBands } from "./utils/colorCode";
import { getRelevantProducts } from "./utils/affiliateData";

// ── Components (pure presentation) ───────────────────────────────────────────
import InputPanel        from "./components/InputPanel";
import ResultsPanel      from "./components/ResultsPanel";
import ColorCodeDisplay  from "./components/ColorCodeDisplay";
import CircuitSchematic  from "./components/CircuitSchematic";
import AffiliatePanel    from "./components/AffiliatePanel";
import EmailCapture      from "./components/EmailCapture";

// ── Email submit handler (swap for your ESP integration) ─────────────────────
async function submitEmail(email) {
  // Replace this stub with your Mailchimp / ConvertKit / Resend API call.
  // Must throw on failure so EmailCapture can display the error.
  console.log("[EmailCapture] Submitting:", email);
  await new Promise((r) => setTimeout(r, 900)); // simulate network
  // Example: uncomment and fill in your endpoint
  // const res = await fetch("/api/subscribe", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email }),
  // });
  // if (!res.ok) throw new Error("Subscription failed. Please try again.");
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  // Raw input state (strings — inputs are uncontrolled number fields)
  const [vs,   setVs]   = useState("");
  const [vf,   setVf]   = useState("");
  const [ifMa, setIfMa] = useState("");

  // ── Validation (pure util call) ───────────────────────────────────────────
  const { errors, canCalc, voltageWarning, vsNum, vfNum, ifNum } = useMemo(
    () => validateInputs(vs, vf, ifMa),
    [vs, vf, ifMa]
  );

  // ── Core calculations (pure util calls, only when valid) ──────────────────
  const exactResistance = canCalc ? calculateResistance(vsNum, vfNum, ifNum)          : null;
  const e24Resistance   = canCalc ? findNearestE24(exactResistance)                    : null;
  const powerW          = canCalc ? calculatePower(ifNum, exactResistance)             : null;
  const powerMw         = powerW  ? powerW * 1000                                      : null;
  const actualCurrentMa = canCalc ? calculateActualCurrent(vsNum, vfNum, e24Resistance): null;
  const voltageDropR    = canCalc ? vsNum - vfNum                                      : null;
  const e24Label        = e24Resistance ? formatResistance(e24Resistance)              : "—";

  // ── Color bands ───────────────────────────────────────────────────────────
  const colorBands = e24Resistance ? getColorBands(e24Resistance) : null;

  // ── Schematic labels (formatted strings — no logic in component) ──────────
  const schematicLabels = {
    vsLabel: vsNum  ? `${vsNum}V`  : "Vs",
    vfLabel: vfNum  ? `${vfNum}V`  : "Vf",
    ifLabel: ifNum  ? `${ifNum}mA` : "If",
    rLabel:  e24Label,
    valid:   canCalc,
  };

  // ── Affiliate products (filtered by power, only when canCalc) ─────────────
  const affiliateProducts = useMemo(
    () => getRelevantProducts({ powerMw, canCalc }),
    [powerMw, canCalc]
  );

  // ── Email handler (stable ref) ────────────────────────────────────────────
  const handleEmailSubmit = useCallback(submitEmail, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-800 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 shadow-[0_0_18px_#fbbf2455]">
            <Zap size={20} color="#0f172a" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[0.95rem] font-bold tracking-wide text-slate-50">
              LED SERIES RESISTOR
            </h1>
            <p className="text-[0.65rem] tracking-[0.12em] text-slate-500">
              PRECISION CALCULATOR · E24 SERIES · IEC 60062
            </p>
          </div>
          <div className="ml-auto hidden text-right text-[0.62rem] leading-relaxed text-slate-700 sm:block">
            <div>R = (Vs − Vf) / If</div>
            <div>P = If² × R</div>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">

          {/* ── Left column: inputs + email ─────────────────────────────── */}
          <div className="flex flex-col gap-5">

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <InputPanel
                vs={vs}
                vf={vf}
                ifMa={ifMa}
                errors={errors}
                voltageWarning={voltageWarning}
                onVsChange={setVs}
                onVfChange={setVf}
                onIfChange={setIfMa}
              />
            </div>

            <EmailCapture
              onSubmit={handleEmailSubmit}
              leadMagnet="Free Resistor Reference Card PDF"
            />
          </div>

          {/* ── Right column: results + color code ──────────────────────── */}
          <div className="flex flex-col gap-5">

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <ResultsPanel
                canCalc={canCalc}
                exactResistance={exactResistance}
                e24Resistance={e24Resistance}
                e24Label={e24Label}
                powerMw={powerMw}
                actualCurrentMa={actualCurrentMa}
                voltageDropR={voltageDropR}
                voltageWarning={voltageWarning}
                vsNum={vsNum}
                vfNum={vfNum}
                ifNum={ifNum}
              />
            </div>

            {canCalc && colorBands && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <ColorCodeDisplay bands={colorBands} e24Label={e24Label} />
              </div>
            )}
          </div>

          {/* ── Full-width: circuit schematic ────────────────────────────── */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 lg:col-span-2">
            <header className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
              <Zap size={11} />
              Circuit Schematic
            </header>
            <CircuitSchematic {...schematicLabels} />
            {canCalc && (
              <div className="mt-3 flex flex-wrap justify-center gap-4 text-[0.68rem] text-slate-500">
                <span><span className="text-amber-400">●</span> Vs = {vsNum}V</span>
                <span><span className="text-amber-400">▶</span> R = {e24Label}</span>
                <span><span className="text-amber-400">◆</span> Vf = {vfNum}V</span>
                <span><span className="text-amber-400">→</span> If ≈ {actualCurrentMa?.toFixed(1)}mA</span>
                <span><span className="text-amber-400">⚡</span> P = {powerMw?.toFixed(1)}mW</span>
              </div>
            )}
          </div>

          {/* ── Full-width: affiliate products ───────────────────────────── */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 lg:col-span-2">
            <AffiliatePanel products={affiliateProducts} />
          </div>

        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 px-5 py-4 text-center text-[0.6rem] tracking-widest text-slate-700">
        PRECISION LED SERIES RESISTOR CALCULATOR · E24 STANDARD · IEC 60062
      </footer>
    </div>
  );
}