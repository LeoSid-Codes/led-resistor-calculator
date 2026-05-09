// LED Resistor Calculator - AffiliatePanel Component
// Responsibility: Renders the monetization product card grid.
// Receives a pre-filtered products array and an activeCategory prop as props.
// Contains ZERO filtering logic — that lives in utils/affiliateData.js.
// Contains ZERO calculation logic.

import { useState } from "react";
import { ExternalLink, Star, ShoppingCart, ChevronRight } from "lucide-react";
import { CATEGORY_LABELS } from "../utils/affiliateData";

// ── Single product card ───────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { name, vendor, priceLabel, rating, reviewCount, description, affiliateUrl, badge, badgeColor } = product;

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col gap-2.5 rounded-lg border border-slate-700 bg-slate-900 p-3.5
                 transition-all duration-200 hover:border-amber-500/50 hover:bg-slate-800 no-underline"
    >
      {/* Badge + vendor row */}
      <div className="flex items-center justify-between gap-2">
        {badge ? (
          <span
            className="rounded px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider"
            style={{ background: badgeColor + "22", color: badgeColor, border: `1px solid ${badgeColor}44` }}
          >
            {badge}
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-[0.65rem] text-slate-500">
          <ShoppingCart size={9} />
          {vendor}
        </span>
      </div>

      {/* Product name */}
      <h3 className="text-[0.82rem] font-semibold leading-snug text-slate-200 group-hover:text-amber-300 transition-colors">
        {name}
      </h3>

      {/* Description */}
      <p className="text-[0.7rem] leading-relaxed text-slate-500">{description}</p>

      {/* Price + rating row */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="font-mono text-sm font-bold text-amber-400">{priceLabel}</span>

        <span className="flex items-center gap-1 text-[0.65rem] text-slate-500">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
          <span className="text-slate-600">({reviewCount.toLocaleString()})</span>
          <ExternalLink size={9} className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
        </span>
      </div>
    </a>
  );
}

// ── Category tab button ───────────────────────────────────────────────────────
function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-md px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider transition-colors",
        active
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          : "text-slate-500 hover:text-slate-300",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AffiliatePanel({ products }) {
  // Derive available categories from the products we received
  const categories = ["all", ...new Set(products.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState("all");

  const displayed =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (!products || products.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
          <ShoppingCart size={11} />
          Recommended Parts
        </div>
        <span className="text-[0.6rem] text-slate-700 italic">Affiliate links · Prices vary</span>
      </header>

      {/* Category tabs */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <CategoryTab
              key={cat}
              label={cat === "all" ? "All" : (CATEGORY_LABELS[cat] ?? cat)}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      )}

      {/* Product grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {displayed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Disclosure */}
      <p className="text-[0.6rem] leading-relaxed text-slate-700">
        As an Amazon Associate, we may earn from qualifying purchases. Prices and availability are subject to change.
      </p>
    </section>
  );
}
