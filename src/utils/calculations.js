
// LED Resistor Calculator - Pure calculation utilities
// Responsibility: All mathematical operations, E24 series logic, validation

const E24_BASE = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];

export function buildE24Series() {
  const values = [];
  for (let exp = 0; exp <= 6; exp++) {
    for (const base of E24_BASE) {
      values.push(parseFloat((base * Math.pow(10, exp)).toPrecision(3)));
    }
  }
  return values.sort((a, b) => a - b);
}

export function findNearestE24(resistance) {
  if (resistance <= 0) return E24_BASE[0];
  const e24Values = buildE24Series();
  let best = e24Values[0];
  let bestDiff = Infinity;
  for (const val of e24Values) {
    const diff = Math.abs(val - resistance);
    if (diff < bestDiff) { bestDiff = diff; best = val; }
  }
  return best;
}

export function formatResistance(value) {
  if (value >= 1000000) return `${(value / 1000000).toPrecision(3)} MΩ`;
  if (value >= 1000) return `${(value / 1000).toPrecision(3)} kΩ`;
  return `${value.toPrecision(3)} Ω`;
}

export function calculateResistance(vs, vf, ifMa) {
  return (vs - vf) / (ifMa / 1000);
}

export function calculatePower(ifMa, resistance) {
  return Math.pow(ifMa / 1000, 2) * resistance;
}

export function calculateActualCurrent(vs, vf, e24Resistance) {
  return ((vs - vf) / e24Resistance) * 1000;
}

export function validateInputs(vs, vf, ifMa) {
  const errors = {};
  const vsNum = parseFloat(vs);
  const vfNum = parseFloat(vf);
  const ifNum = parseFloat(ifMa);

  if (vs !== "" && (isNaN(vsNum) || vsNum <= 0)) errors.vs = "Must be a positive number";
  if (vf !== "" && (isNaN(vfNum) || vfNum <= 0)) errors.vf = "Must be a positive number";
  if (ifMa !== "" && (isNaN(ifNum) || ifNum <= 0)) errors.ifMa = "Must be a positive number";
  if (ifMa !== "" && !isNaN(ifNum) && (ifNum < 1 || ifNum > 50)) errors.ifMa = "Typical range: 1–50 mA";

  const canCalc = vs !== "" && vf !== "" && ifMa !== ""
    && !isNaN(vsNum) && !isNaN(vfNum) && !isNaN(ifNum)
    && vsNum > 0 && vfNum > 0 && ifNum > 0
    && vfNum < vsNum;

  const voltageWarning = vs !== "" && vf !== "" && !isNaN(vsNum) && !isNaN(vfNum) && vfNum >= vsNum;

  return { errors, canCalc, voltageWarning, vsNum, vfNum, ifNum };
}