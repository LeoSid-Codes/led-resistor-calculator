import { useState, useCallback, useEffect } from "react";
import { Zap, Sun, Calculator, Copy, Check, AlertTriangle, ChevronRight } from "lucide-react";

// ── E24 series ──────────────────────────────────────────────────────────────
const E24_BASE = [1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,
                  3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1];

function buildE24() {
  const values = [];
  for (let exp = 0; exp <= 6; exp++) {
    for (const base of E24_BASE) {
      values.push(parseFloat((base * Math.pow(10, exp)).toPrecision(3)));
    }
  }
  return values.sort((a, b) => a - b);
}
const E24_VALUES = buildE24();

function nearestE24(r) {
  if (r <= 0) return E24_VALUES[0];
  let best = E24_VALUES[0];
  let bestDiff = Infinity;
  for (const v of E24_VALUES) {
    const diff = Math.abs(v - r);
    if (diff < bestDiff) { bestDiff = diff; best = v; }
  }
  return best;
}

function formatResistance(r) {
  if (r >= 1_000_000) return `${(r / 1_000_000).toPrecision(3)} MΩ`;
  if (r >= 1_000)     return `${(r / 1_000).toPrecision(3)} kΩ`;
  return `${r.toPrecision(3)} Ω`;
}

// ── Resistor color code ──────────────────────────────────────────────────────
const BAND_COLORS = [
  { name: "Black",  hex: "#1a1a1a", text: "#ffffff" },
  { name: "Brown",  hex: "#8B4513", text: "#ffffff" },
  { name: "Red",    hex: "#DC143C", text: "#ffffff" },
  { name: "Orange", hex: "#FF8C00", text: "#000000" },
  { name: "Yellow", hex: "#FFD700", text: "#000000" },
  { name: "Green",  hex: "#228B22", text: "#ffffff" },
  { name: "Blue",   hex: "#1E90FF", text: "#ffffff" },
  { name: "Violet", hex: "#9400D3", text: "#ffffff" },
  { name: "Grey",   hex: "#808080", text: "#ffffff" },
  { name: "White",  hex: "#F5F5F5", text: "#000000" },
];
const MULTIPLIER_COLORS = [
  { name: "Black",  hex: "#1a1a1a", multiplier: 1 },
  { name: "Brown",  hex: "#8B4513", multiplier: 10 },
  { name: "Red",    hex: "#DC143C", multiplier: 100 },
  { name: "Orange", hex: "#FF8C00", multiplier: 1_000 },
  { name: "Yellow", hex: "#FFD700", multiplier: 10_000 },
  { name: "Green",  hex: "#228B22", multiplier: 100_000 },
  { name: "Blue",   hex: "#1E90FF", multiplier: 1_000_000 },
  { name: "Silver", hex: "#C0C0C0", multiplier: 0.01 },
  { name: "Gold",   hex: "#FFD700", multiplier: 0.1 },
];
const TOLERANCE_COLORS = [
  { name: "Brown",  hex: "#8B4513", tol: "±1%" },
  { name: "Red",    hex: "#DC143C", tol: "±2%" },
  { name: "Gold",   hex: "#FFD700", tol: "±5%" },
  { name: "Silver", hex: "#C0C0C0", tol: "±10%" },
];

function resistorColorBands(r) {
  // 4-band code
  const rounded = Math.round(r);
  if (rounded <= 0) return null;
  const digits = rounded.toString().replace(/0+$/, "");
  const multiplier = rounded / Math.pow(10, digits.length - 2);
  const d1 = Math.floor(parseInt(digits[0] || 0));
  const d2 = digits.length >= 2 ? Math.floor(parseInt(digits[1])) : 0;
  const mult = Math.pow(10, Math.max(0, rounded.toString().length - 2));
  const multColor = MULTIPLIER_COLORS.find(c => c.multiplier === mult) || MULTIPLIER_COLORS[0];
  return {
    band1: BAND_COLORS[d1],
    band2: BAND_COLORS[d2],
    band3: multColor,
    band4: TOLERANCE_COLORS[2], // Gold ±5%
  };
}

// ── Circuit SVG ──────────────────────────────────────────────────────────────
function CircuitSVG({ vs, vf, iF, r, e24r, valid }) {
  const vsLabel = vs   ? `${vs}V`  : "Vs";
  const vfLabel = vf   ? `${vf}V`  : "Vf";
  const rLabel  = e24r ? formatResistance(e24r) : "R";
  const iLabel  = iF   ? `${iF}mA` : "If";

  return (
    <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg"
         style={{ width: "100%", height: "auto", display: "block" }}>
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24"/>
        </marker>
      </defs>
      <rect width="420" height="220" fill="url(#grid)"/>

      {/* Wire color */}
      {(() => {
        const wireColor = valid ? "#fbbf24" : "#475569";
        const glow = valid ? "url(#glow)" : "none";
        return (
          <>
            {/* Top wire: left → right */}
            <line x1="40" y1="40" x2="380" y2="40" stroke={wireColor} strokeWidth="2.5" filter={glow}/>
            {/* Bottom wire: right → left */}
            <line x1="40" y1="180" x2="380" y2="180" stroke={wireColor} strokeWidth="2.5" filter={glow}/>
            {/* Left vertical wire */}
            <line x1="40" y1="40" x2="40" y2="70" stroke={wireColor} strokeWidth="2.5" filter={glow}/>
            <line x1="40" y1="150" x2="40" y2="180" stroke={wireColor} strokeWidth="2.5" filter={glow}/>
            {/* Right vertical wire */}
            <line x1="380" y1="40" x2="380" y2="80" stroke={wireColor} strokeWidth="2.5" filter={glow}/>
            <line x1="380" y1="140" x2="380" y2="180" stroke={wireColor} strokeWidth="2.5" filter={glow}/>

            {/* Current direction arrow on top wire */}
            {valid && (
              <line x1="195" y1="40" x2="225" y2="40" stroke="#fbbf24"
                    strokeWidth="2.5" markerEnd="url(#arrow)" filter={glow}/>
            )}

            {/* ── BATTERY (left side) ── */}
            {/* + terminal line */}
            <line x1="30" y1="70"  x2="50" y2="70"  stroke={wireColor} strokeWidth="3"/>
            <line x1="35" y1="85"  x2="45" y2="85"  stroke={wireColor} strokeWidth="1.5"/>
            <line x1="30" y1="100" x2="50" y2="100" stroke={wireColor} strokeWidth="3"/>
            <line x1="35" y1="115" x2="45" y2="115" stroke={wireColor} strokeWidth="1.5"/>
            <line x1="30" y1="130" x2="50" y2="130" stroke={wireColor} strokeWidth="3"/>
            <line x1="35" y1="145" x2="45" y2="145" stroke={wireColor} strokeWidth="1.5"/>
            {/* Battery label */}
            <text x="62" y="112" fill="#94a3b8" fontSize="11" fontFamily="monospace">+</text>
            <text x="62" y="125" fill="#94a3b8" fontSize="11" fontFamily="monospace">-</text>
            <text x="14" y="115" fill="#fbbf24" fontSize="12" fontWeight="bold" fontFamily="monospace"
                  textAnchor="middle">{vsLabel}</text>

            {/* ── RESISTOR (top, center) ── */}
            {/* zigzag */}
            {(() => {
              const rx = 150, ry = 32, rw = 80, rh = 16;
              const zx = [rx, rx+10, rx+20, rx+30, rx+40, rx+50, rx+60, rx+70, rx+80];
              const zy = [ry, ry-rh/2, ry+rh/2, ry-rh/2, ry+rh/2, ry-rh/2, ry+rh/2, ry-rh/2, ry];
              const pts = zx.map((x,i)=>`${x},${zy[i]}`).join(" ");
              return (
                <>
                  <rect x={rx-2} y={ry-rh/2-2} width={rw+4} height={rh+4}
                        rx="2" fill="#0f172a" stroke={wireColor} strokeWidth="1" opacity="0.5"/>
                  <polyline points={pts} fill="none" stroke={wireColor} strokeWidth="2.5"
                            strokeLinejoin="round" filter={glow}/>
                  <text x="190" y="22" fill="#fbbf24" fontSize="11" fontWeight="bold"
                        fontFamily="monospace" textAnchor="middle">{rLabel}</text>
                  <text x="190" y="58" fill="#64748b" fontSize="9"
                        fontFamily="monospace" textAnchor="middle">{iLabel}</text>
                </>
              );
            })()}

            {/* ── LED (right side) ── */}
            {/* Triangle + bar */}
            <polygon points="380,80 365,100 395,100" fill={valid ? "#fbbf24" : "#334155"}
                     stroke={wireColor} strokeWidth="2" filter={valid ? glow : "none"}/>
            <line x1="395" y1="80" x2="395" y2="100" stroke={wireColor} strokeWidth="2.5"/>
            <line x1="380" y1="100" x2="380" y2="140" stroke={wireColor} strokeWidth="2.5" filter={glow}/>
            <line x1="380" y1="80"  x2="380" y2="80"  stroke={wireColor} strokeWidth="2.5"/>
            {/* LED light rays */}
            {valid && (
              <>
                <line x1="400" y1="86" x2="412" y2="78" stroke="#fbbf24" strokeWidth="1.5"
                      strokeLinecap="round" opacity="0.7" filter={glow}/>
                <line x1="403" y1="92" x2="416" y2="88" stroke="#fbbf24" strokeWidth="1.5"
                      strokeLinecap="round" opacity="0.7" filter={glow}/>
                <line x1="403" y1="98" x2="416" y2="98" stroke="#fbbf24" strokeWidth="1.5"
                      strokeLinecap="round" opacity="0.5" filter={glow}/>
              </>
            )}
            <text x="380" y="162" fill="#fbbf24" fontSize="11" fontWeight="bold"
                  fontFamily="monospace" textAnchor="middle">LED</text>
            <text x="380" y="175" fill="#64748b" fontSize="9"
                  fontFamily="monospace" textAnchor="middle">{vfLabel}</text>
          </>
        );
      })()}
    </svg>
  );
}

// ── Resistor Body SVG ─────────────────────────────────────────────────────────
function ResistorBands({ bands }) {
  if (!bands) return null;
  const { band1, band2, band3, band4 } = bands;
  return (
    <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"
         style={{ width: "100%", maxWidth: 260, display: "block" }}>
      {/* Lead wires */}
      <line x1="0"   y1="30" x2="30"  y2="30" stroke="#94a3b8" strokeWidth="2"/>
      <line x1="170" y1="30" x2="200" y2="30" stroke="#94a3b8" strokeWidth="2"/>
      {/* Body */}
      <rect x="30" y="12" width="140" height="36" rx="18" fill="#e8d5a3"/>
      <rect x="30" y="12" width="140" height="36" rx="18"
            fill="none" stroke="#b8a060" strokeWidth="1"/>
      {/* Bands */}
      <rect x="52"  y="12" width="14" height="36" rx="1" fill={band1.hex}/>
      <rect x="74"  y="12" width="14" height="36" rx="1" fill={band2.hex}/>
      <rect x="96"  y="12" width="14" height="36" rx="1" fill={band3.hex}/>
      <rect x="128" y="12" width="14" height="36" rx="1" fill={band4.hex}/>
    </svg>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, unit, placeholder, hint, error, icon: Icon }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem",
                      fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.4rem" }}>
        {Icon && <Icon size={12}/>}
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "#0f172a",
            border: `1.5px solid ${error ? "#ef4444" : "#334155"}`,
            borderRadius: "6px",
            padding: "0.65rem 3rem 0.65rem 0.85rem",
            color: "#f8fafc",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = "#fbbf24"; }}
          onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "#334155"; }}
        />
        <span style={{ position: "absolute", right: "0.75rem", top: "50%",
                       transform: "translateY(-50%)",
                       color: "#64748b", fontFamily: "monospace", fontSize: "0.85rem",
                       pointerEvents: "none" }}>
          {unit}
        </span>
      </div>
      {error && (
        <p style={{ marginTop: "0.25rem", fontSize: "0.72rem", color: "#f87171",
                    display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <AlertTriangle size={10}/> {error}
        </p>
      )}
      {!error && hint && (
        <p style={{ marginTop: "0.25rem", fontSize: "0.72rem", color: "#475569" }}>{hint}</p>
      )}
    </div>
  );
}

// ── Result Row ────────────────────────────────────────────────────────────────
function ResultRow({ label, value, sub, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  padding: "0.6rem 0", borderBottom: "1px solid #1e293b" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.8rem", letterSpacing: "0.05em",
                     textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace",
                     color: accent ? "#fbbf24" : "#f1f5f9",
                     fontSize: accent ? "1.25rem" : "1rem", fontWeight: accent ? 700 : 400 }}>
        {value}
        {sub && <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: "0.3rem" }}>{sub}</span>}
      </span>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [vs, setVs]   = useState("");
  const [vf, setVf]   = useState("");
  const [iF, setIF]   = useState("");
  const [copied, setCopied] = useState(false);

  // Validation
  const errors = {};
  const vsNum = parseFloat(vs);
  const vfNum = parseFloat(vf);
  const iFNum = parseFloat(iF);

  if (vs !== "" && (isNaN(vsNum) || vsNum <= 0))   errors.vs = "Must be a positive number";
  if (vf !== "" && (isNaN(vfNum) || vfNum <= 0))   errors.vf = "Must be a positive number";
  if (iF !== "" && (isNaN(iFNum) || iFNum <= 0))   errors.iF = "Must be a positive number";
  if (iF !== "" && !isNaN(iFNum) && (iFNum < 1 || iFNum > 50)) errors.iF = "Typical range: 1–50 mA";

  const voltageWarning = vs !== "" && vf !== "" && !isNaN(vsNum) && !isNaN(vfNum) && vfNum >= vsNum;

  // Derived calculations
  const canCalc = vs !== "" && vf !== "" && iF !== ""
    && !isNaN(vsNum) && !isNaN(vfNum) && !isNaN(iFNum)
    && vsNum > 0 && vfNum > 0 && iFNum > 0
    && vfNum < vsNum;

  const R     = canCalc ? (vsNum - vfNum) / (iFNum / 1000) : null;
  const P     = canCalc ? Math.pow(iFNum / 1000, 2) * R    : null;
  const e24r  = R != null ? nearestE24(R) : null;
  const actualI = (e24r && canCalc) ? ((vsNum - vfNum) / e24r) * 1000 : null;
  const bands = e24r ? resistorColorBands(e24r) : null;

  const copyResults = useCallback(() => {
    if (!canCalc) return;
    const text = [
      "── LED Resistor Calculator Results ──",
      `Source Voltage (Vs):     ${vsNum} V`,
      `LED Forward Voltage (Vf): ${vfNum} V`,
      `LED Current (If):         ${iFNum} mA`,
      `Calculated Resistance:    ${R.toFixed(2)} Ω`,
      `Nearest E24 Value:        ${formatResistance(e24r)}`,
      `Power Dissipation:        ${(P * 1000).toFixed(2)} mW`,
      `Actual LED Current:       ${actualI.toFixed(2)} mA`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [canCalc, vsNum, vfNum, iFNum, R, e24r, P, actualI]);

  // Styles
  const cardStyle = {
    background: "#1e293b",
    borderRadius: "12px",
    border: "1px solid #334155",
    padding: "1.5rem",
  };

  const sectionLabel = {
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#f1f5f9",
      fontFamily: "'JetBrains Mono', monospace",
      padding: "0",
    }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid #1e293b",
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        <div style={{
          background: "#fbbf24",
          borderRadius: "8px",
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px #fbbf2466",
        }}>
          <Zap size={20} color="#0f172a" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700,
                       letterSpacing: "0.04em", color: "#f8fafc" }}>
            LED SERIES RESISTOR
          </h1>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b", letterSpacing: "0.08em" }}>
            PRECISION CALCULATOR · E24 SERIES
          </p>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#334155",
                      textAlign: "right", lineHeight: 1.6 }}>
          <div style={{ color: "#475569" }}>R = (Vs − Vf) / If</div>
          <div style={{ color: "#334155" }}>P = If² × R</div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "1.5rem 1rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
      }}>
        {/* ── Inputs ── */}
        <div style={cardStyle}>
          <div style={sectionLabel}>
            <Calculator size={12}/> Parameters
          </div>

          {voltageWarning && (
            <div style={{
              background: "#7f1d1d22",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "0.65rem 0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}>
              <AlertTriangle size={14} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }}/>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#fca5a5", lineHeight: 1.5 }}>
                <strong>LED damage risk:</strong> Forward voltage must be less than source voltage.
              </p>
            </div>
          )}

          <InputField
            label="Source Voltage"
            value={vs}
            onChange={setVs}
            unit="V"
            placeholder="e.g. 5.0"
            hint="Supply or battery voltage"
            error={errors.vs}
            icon={Zap}
          />
          <InputField
            label="LED Forward Voltage"
            value={vf}
            onChange={setVf}
            unit="V"
            placeholder="e.g. 2.1"
            hint="Datasheet Vf (red≈1.8V, blue≈3.2V)"
            error={errors.vf}
            icon={Sun}
          />
          <InputField
            label="LED Current"
            value={iF}
            onChange={setIF}
            unit="mA"
            placeholder="e.g. 20"
            hint="Typical operating current"
            error={errors.iF}
            icon={Calculator}
          />
        </div>

        {/* ── Results ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={cardStyle}>
            <div style={sectionLabel}>
              <Zap size={12}/> Results
            </div>

            {canCalc ? (
              <>
                <ResultRow label="Exact Resistance" value={`${R.toFixed(2)} Ω`} />
                <ResultRow label="E24 Standard Value" value={formatResistance(e24r)} accent />
                <ResultRow label="Power Dissipation"
                           value={(P * 1000).toFixed(2)}
                           sub="mW"
                           accent={P > 0.25} />
                <ResultRow label="Actual LED Current"
                           value={actualI != null ? actualI.toFixed(2) : "—"}
                           sub="mA" />
                <ResultRow label="Voltage Drop (R)"
                           value={`${(vsNum - vfNum).toFixed(2)} V`} />

                {P > 0.25 && (
                  <p style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "#fbbf24",
                               display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <AlertTriangle size={11}/> Use ½W or 1W resistor (P &gt; 250mW)
                  </p>
                )}

                <button
                  onClick={copyResults}
                  style={{
                    marginTop: "1rem",
                    width: "100%",
                    padding: "0.6rem",
                    background: copied ? "#15803d22" : "#fbbf2418",
                    border: `1px solid ${copied ? "#15803d" : "#fbbf24"}`,
                    borderRadius: "6px",
                    color: copied ? "#4ade80" : "#fbbf24",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    letterSpacing: "0.06em",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? <><Check size={13}/> COPIED!</> : <><Copy size={13}/> COPY RESULTS</>}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#475569" }}>
                <Calculator size={28} style={{ margin: "0 auto 0.5rem" }} opacity={0.4}/>
                <p style={{ fontSize: "0.78rem", margin: 0 }}>
                  {voltageWarning
                    ? "Fix voltage error to calculate"
                    : "Enter all values to calculate"}
                </p>
              </div>
            )}
          </div>

          {/* Color Code */}
          {bands && canCalc && (
            <div style={cardStyle}>
              <div style={sectionLabel}>
                <ChevronRight size={12}/> Color Code · {formatResistance(e24r)} ±5%
              </div>
              <ResistorBands bands={bands}/>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.4rem",
                marginTop: "0.75rem",
              }}>
                {[bands.band1, bands.band2, bands.band3, bands.band4].map((b, i) => (
                  <div key={i} style={{
                    background: b.hex,
                    borderRadius: "4px",
                    padding: "0.25rem",
                    textAlign: "center",
                    fontSize: "0.6rem",
                    color: (b.hex === "#F5F5F5" || b.hex === "#FFD700" || b.hex === "#C0C0C0")
                           ? "#000" : "#fff",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    border: "1px solid #00000033",
                  }}>
                    {b.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Circuit Schematic ── */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <div style={sectionLabel}>
            <Zap size={12}/> Circuit Schematic
          </div>
          <CircuitSVG
            vs={vsNum || null}
            vf={vfNum || null}
            iF={iFNum || null}
            r={R}
            e24r={e24r}
            valid={canCalc}
          />
          {canCalc && (
            <div style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              color: "#64748b",
              flexWrap: "wrap",
            }}>
              <span><span style={{ color: "#fbbf24" }}>●</span> Vs = {vsNum}V</span>
              <span><span style={{ color: "#fbbf24" }}>▶</span> R = {formatResistance(e24r)}</span>
              <span><span style={{ color: "#fbbf24" }}>◆</span> LED Vf = {vfNum}V</span>
              <span><span style={{ color: "#fbbf24" }}>→</span> If ≈ {actualI?.toFixed(1)}mA</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "1.25rem",
        fontSize: "0.65rem",
        color: "#334155",
        letterSpacing: "0.08em",
        borderTop: "1px solid #1e293b",
      }}>
        PRECISION LED SERIES RESISTOR CALCULATOR · E24 STANDARD · IEC 60062
      </footer>
    </div>
  );
}