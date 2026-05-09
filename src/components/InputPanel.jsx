// LED Resistor Calculator - InputPanel Component
// Responsibility: Renders the three calculator input fields and voltage-damage warning.
// Receives all values, errors, and onChange handlers as props.
// Contains ZERO calculation logic. Pure controlled-input presentation only.

import { Zap, Sun, Activity, AlertTriangle } from "lucide-react";

// ── Sub-component: single labelled input field ────────────────────────────────
function InputField({ label, value, onChange, unit, placeholder, hint, error, Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
        {Icon && <Icon size={11} />}
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full bg-slate-950 rounded-md px-3 pr-14 py-2.5",
            "font-mono text-base text-slate-100 placeholder-slate-600",
            "border outline-none transition-colors duration-150",
            "focus:border-amber-400",
            error ? "border-red-500" : "border-slate-700",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500">
          {unit}
        </span>
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-[0.7rem] text-red-400">
          <AlertTriangle size={10} /> {error}
        </p>
      ) : hint ? (
        <p className="text-[0.68rem] text-slate-600">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function InputPanel({ vs, vf, ifMa, errors, voltageWarning, onVsChange, onVfChange, onIfChange }) {
  return (
    <section className="flex flex-col gap-5">

      {/* Section header */}
      <header className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
        <Activity size={11} />
        Circuit Parameters
      </header>

      {/* Voltage damage warning */}
      {voltageWarning && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-3"
        >
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-[0.73rem] leading-relaxed text-red-300">
            <span className="font-bold">LED damage risk:</span> Forward voltage (Vf) must be
            less than source voltage (Vs). No current will flow.
          </p>
        </div>
      )}

      {/* Input fields */}
      <InputField
        label="Source Voltage"
        value={vs}
        onChange={onVsChange}
        unit="V"
        placeholder="e.g. 5.0"
        hint="Supply or battery voltage (Vs)"
        error={errors.vs}
        Icon={Zap}
      />

      <InputField
        label="LED Forward Voltage"
        value={vf}
        onChange={onVfChange}
        unit="V"
        placeholder="e.g. 2.1"
        hint="From datasheet — Red ≈ 1.8V · Blue/White ≈ 3.2V"
        error={errors.vf}
        Icon={Sun}
      />

      <InputField
        label="LED Forward Current"
        value={ifMa}
        onChange={onIfChange}
        unit="mA"
        placeholder="e.g. 20"
        hint="Typical operating current (1–50 mA)"
        error={errors.ifMa}
        Icon={Activity}
      />
    </section>
  );
}