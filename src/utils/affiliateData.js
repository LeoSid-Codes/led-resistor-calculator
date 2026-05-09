// LED Resistor Calculator - Affiliate Product Data
// Responsibility: Static product catalog and smart product recommendation logic.
// Zero React. Zero UI. Pure data and filtering functions only.

/**
 * Affiliate product catalog.
 * Replace `affiliateUrl` values with your actual tracked affiliate links.
 * `tag` is your Amazon Associates / DigiKey partner tag.
 */
export const AFFILIATE_PRODUCTS = [
  // ── Resistor Kits ──────────────────────────────────────────────────────────
  {
    id: "rk-e24-600",
    category: "resistors",
    name: "E24 Resistor Kit – 600pcs (1Ω–1MΩ)",
    vendor: "Amazon",
    priceLabel: "~$8",
    rating: 4.6,
    reviewCount: 3200,
    description: "600 resistors spanning the full E24 series across 24 values. Every value you'll ever need.",
    affiliateUrl: "https://www.amazon.com/s?k=e24+resistor+kit+600&tag=siddhi077-21",
    badge: "Best Value",
    badgeColor: "#fbbf24",
    triggerConditions: { always: true },
  },
  {
    id: "rk-e24-1000",
    category: "resistors",
    name: "Elegoo 17-Value 1% Metal Film Resistor Kit",
    vendor: "Amazon",
    priceLabel: "~$10",
    rating: 4.7,
    reviewCount: 8100,
    description: "1% tolerance metal film resistors. Superior to 5% carbon film for precision circuits.",
    affiliateUrl: "https://www.amazon.com/s?k=elegoo+metal+film+resistor+kit&tag=siddhi077-21",
    badge: "High Precision",
    badgeColor: "#34d399",
    triggerConditions: { always: true },
  },

  // ── High-Power Resistors ───────────────────────────────────────────────────
  {
    id: "rp-half-watt",
    category: "power-resistors",
    name: "½W Carbon Film Resistor Assortment",
    vendor: "Amazon",
    priceLabel: "~$7",
    rating: 4.5,
    reviewCount: 1400,
    description: "½W rated resistors for circuits dissipating 100–500mW. Handles typical LED driver loads.",
    affiliateUrl: "https://www.amazon.com/s?k=1%2F2+watt+resistor+assortment&tag=siddhi077-21",
    badge: "Recommended",
    badgeColor: "#60a5fa",
    // Shown when power > 100mW and <= 500mW
    triggerConditions: { minPowerMw: 100, maxPowerMw: 500 },
  },
  {
    id: "rp-one-watt",
    category: "power-resistors",
    name: "1W Metal Oxide Resistor Kit",
    vendor: "Amazon",
    priceLabel: "~$9",
    rating: 4.6,
    reviewCount: 920,
    description: "1W power resistors for high-current LED arrays. Runs cool at 500mW–1W dissipation.",
    affiliateUrl: "https://www.amazon.com/s?k=1+watt+metal+oxide+resistor+kit&tag=siddhi077-21",
    badge: "High Power",
    badgeColor: "#f87171",
    // Shown when power > 500mW
    triggerConditions: { minPowerMw: 500 },
  },

  // ── LEDs ───────────────────────────────────────────────────────────────────
  {
    id: "led-5mm-assortment",
    category: "leds",
    name: "5mm LED Assortment – 200pcs (R/G/B/Y/W)",
    vendor: "Amazon",
    priceLabel: "~$8",
    rating: 4.5,
    reviewCount: 5600,
    description: "200 assorted 5mm LEDs across five colors. Ideal for prototyping and educational projects.",
    affiliateUrl: "https://www.amazon.com/s?k=5mm+led+assortment+200+pack&tag=siddhi077-21",
    badge: null,
    triggerConditions: { always: true },
  },
  {
    id: "led-smd-3528",
    category: "leds",
    name: "SMD 3528 LED Strip – 5m RGB",
    vendor: "Amazon",
    priceLabel: "~$12",
    rating: 4.4,
    reviewCount: 2300,
    description: "Flexible 5-meter RGB LED strip. Perfect for multi-LED series/parallel driver projects.",
    affiliateUrl: "https://www.amazon.com/s?k=smd+3528+rgb+led+strip+5m&tag=siddhi077-21",
    badge: null,
    triggerConditions: { always: true },
  },

  // ── Multimeters ────────────────────────────────────────────────────────────
  {
    id: "mm-dt830",
    category: "tools",
    name: "AstroAI Digital Multimeter – True RMS",
    vendor: "Amazon",
    priceLabel: "~$15",
    rating: 4.6,
    reviewCount: 12000,
    description: "Verify Vf and If in your real circuit. Essential for any LED project build.",
    affiliateUrl: "https://www.amazon.com/s?k=astroai+digital+multimeter&tag=siddhi077-21",
    badge: "Essential Tool",
    badgeColor: "#a78bfa",
    triggerConditions: { always: true },
  },

  // ── Breadboards & Kits ─────────────────────────────────────────────────────
  {
    id: "bb-830-bundle",
    category: "tools",
    name: "830-Point Breadboard + Jumper Wire Bundle",
    vendor: "Amazon",
    priceLabel: "~$11",
    rating: 4.5,
    reviewCount: 7800,
    description: "Build and test your LED resistor circuit without soldering. Includes 65 jumper wires.",
    affiliateUrl: "https://www.amazon.com/s?k=830+breadboard+jumper+wire+kit&tag=siddhi077-21",
    badge: null,
    triggerConditions: { always: true },
  },
];

/**
 * Returns relevant affiliate products based on the current calculation results.
 *
 * @param {object} params
 * @param {number|null} params.powerMw  - Dissipated power in milliwatts
 * @param {boolean}     params.canCalc  - Whether a valid calculation exists
 * @param {string[]}    [params.categories] - Optional category filter
 * @returns {object[]} Filtered, sorted product list
 */
export function getRelevantProducts({ powerMw, canCalc, categories }) {
  return AFFILIATE_PRODUCTS.filter(product => {
    const { triggerConditions: tc } = product;

    // Category filter
    if (categories && categories.length > 0 && !categories.includes(product.category)) {
      return false;
    }

    // Always-show products
    if (tc.always) return true;

    // Power-gated products – only show when we have a real calculation
    if (!canCalc || powerMw == null) return false;
    if (tc.minPowerMw != null && powerMw < tc.minPowerMw) return false;
    if (tc.maxPowerMw != null && powerMw > tc.maxPowerMw) return false;

    return true;
  });
}

/**
 * Returns the category labels for display purposes.
 */
export const CATEGORY_LABELS = {
  "resistors":       "Resistors",
  "power-resistors": "Power Resistors",
  "leds":            "LEDs",
  "tools":           "Tools & Equipment",
};