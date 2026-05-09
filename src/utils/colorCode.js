// LED Resistor Calculator - Resistor Color Code Utilities
// Responsibility: All resistor color band data and 4-band color code derivation logic.
// Zero React. Zero UI. Pure data transformation only.

export const DIGIT_COLORS = [
  { digit: 0, name: "Black",  hex: "#1a1a1a", textColor: "#ffffff" },
  { digit: 1, name: "Brown",  hex: "#8B4513", textColor: "#ffffff" },
  { digit: 2, name: "Red",    hex: "#DC143C", textColor: "#ffffff" },
  { digit: 3, name: "Orange", hex: "#FF8C00", textColor: "#000000" },
  { digit: 4, name: "Yellow", hex: "#FFD700", textColor: "#000000" },
  { digit: 5, name: "Green",  hex: "#228B22", textColor: "#ffffff" },
  { digit: 6, name: "Blue",   hex: "#1E90FF", textColor: "#ffffff" },
  { digit: 7, name: "Violet", hex: "#9400D3", textColor: "#ffffff" },
  { digit: 8, name: "Grey",   hex: "#808080", textColor: "#ffffff" },
  { digit: 9, name: "White",  hex: "#F5F5F5", textColor: "#000000" },
];

export const MULTIPLIER_COLORS = [
  { name: "Black",  hex: "#1a1a1a", multiplier: 1,         exponent: 0  },
  { name: "Brown",  hex: "#8B4513", multiplier: 10,        exponent: 1  },
  { name: "Red",    hex: "#DC143C", multiplier: 100,       exponent: 2  },
  { name: "Orange", hex: "#FF8C00", multiplier: 1_000,     exponent: 3  },
  { name: "Yellow", hex: "#FFD700", multiplier: 10_000,    exponent: 4  },
  { name: "Green",  hex: "#228B22", multiplier: 100_000,   exponent: 5  },
  { name: "Blue",   hex: "#1E90FF", multiplier: 1_000_000, exponent: 6  },
  { name: "Gold",   hex: "#CFB53B", multiplier: 0.1,       exponent: -1 },
  { name: "Silver", hex: "#A8A9AD", multiplier: 0.01,      exponent: -2 },
];

// Standard 5% gold tolerance - always band 4 for 4-band resistors
export const TOLERANCE_GOLD = { name: "Gold", hex: "#CFB53B", tolerance: "±5%", textColor: "#000000" };

/**
 * Derives the 4-band color code for a given resistance value.
 * Returns null if the value cannot be encoded.
 *
 * @param {number} resistanceOhms - Resistance in ohms (must be positive)
 * @returns {{ band1: object, band2: object, band3: object, band4: object } | null}
 */
export function getColorBands(resistanceOhms) {
  if (!resistanceOhms || resistanceOhms <= 0) return null;

  const rounded = Math.round(resistanceOhms);
  if (rounded <= 0) return null;

  // Find the multiplier exponent: we need a 2-digit significand
  // e.g. 4700 → significand=47, exponent=2 (×100)
  let significand = rounded;
  let exponent = 0;

  // Reduce to 2 significant digits
  while (significand >= 100) {
    significand = Math.round(significand / 10);
    exponent++;
  }
  while (significand < 10 && significand > 0) {
    significand *= 10;
    exponent--;
  }

  const d1 = Math.floor(significand / 10);
  const d2 = significand % 10;

  const band1 = DIGIT_COLORS[d1];
  const band2 = DIGIT_COLORS[d2];
  const band3 = MULTIPLIER_COLORS.find(c => c.exponent === exponent) || MULTIPLIER_COLORS[0];
  const band4 = TOLERANCE_GOLD;

  if (!band1 || !band2 || !band3) return null;

  return { band1, band2, band3, band4 };
}