"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Simplified India map with major states/regions as SVG paths
// Data is fictional but plausible for AI adoption readiness
const REGIONS = [
  {
    id: "maharashtra",
    name: "Maharashtra",
    adoption: 92,
    stats: "Mumbai AI Hub • 340+ startups",
    // Simplified polygon path (approximate)
    path: "M 140 180 L 155 170 L 170 175 L 175 190 L 180 210 L 175 225 L 165 230 L 150 225 L 140 210 L 135 195 Z",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    adoption: 89,
    stats: "Bengaluru • 450+ AI companies",
    path: "M 130 230 L 150 225 L 165 230 L 175 225 L 180 240 L 175 260 L 160 265 L 145 260 L 130 250 L 125 240 Z",
  },
  {
    id: "tamilnadu",
    name: "Tamil Nadu",
    adoption: 85,
    stats: "Chennai Corridor • 200+ firms",
    path: "M 160 265 L 175 260 L 185 265 L 190 280 L 185 295 L 170 300 L 160 290 L 155 275 Z",
  },
  {
    id: "telangana",
    name: "Telangana",
    adoption: 82,
    stats: "Hyderabad • 180+ AI labs",
    path: "M 130 230 L 125 240 L 120 255 L 125 270 L 135 275 L 145 260 L 145 250 L 130 250 Z",
  },
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    adoption: 88,
    stats: "Gurugram-Noida • 300+ firms",
    path: "M 125 100 L 140 95 L 148 100 L 145 115 L 135 118 L 125 112 Z",
  },
  {
    id: "gujarat",
    name: "Gujarat",
    adoption: 76,
    stats: "Ahmedabad • 120+ startups",
    path: "M 70 140 L 90 130 L 110 135 L 125 140 L 130 155 L 125 170 L 110 175 L 90 170 L 75 160 L 65 150 Z",
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    adoption: 58,
    stats: "Jaipur • 45+ startups",
    path: "M 80 80 L 110 75 L 125 80 L 135 95 L 130 120 L 115 130 L 90 130 L 70 120 L 65 100 Z",
  },
  {
    id: "westbengal",
    name: "West Bengal",
    adoption: 72,
    stats: "Kolkata • 90+ AI firms",
    path: "M 175 120 L 190 115 L 200 125 L 205 145 L 200 160 L 190 165 L 180 155 L 175 140 Z",
  },
  {
    id: "up",
    name: "Uttar Pradesh",
    adoption: 65,
    stats: "Noida-Lucknow • 85+ firms",
    path: "M 120 95 L 150 90 L 165 95 L 170 115 L 165 130 L 150 135 L 130 130 L 120 115 Z",
  },
  {
    id: "kerala",
    name: "Kerala",
    adoption: 78,
    stats: "Kochi-Thiruvananthapuram • 60+ firms",
    path: "M 135 275 L 150 270 L 155 285 L 150 300 L 140 305 L 130 295 L 128 285 Z",
  },
  {
    id: "punjab",
    name: "Punjab",
    adoption: 70,
    stats: "Chandigarh • 50+ AI startups",
    path: "M 110 65 L 130 60 L 140 65 L 138 80 L 125 85 L 112 78 Z",
  },
  {
    id: "mp",
    name: "Madhya Pradesh",
    adoption: 48,
    stats: "Bhopal-Indore • 30+ firms",
    path: "M 100 140 L 125 135 L 140 145 L 145 170 L 140 200 L 125 210 L 105 205 L 90 190 L 85 170 L 90 150 Z",
  },
  {
    id: "bihar",
    name: "Bihar",
    adoption: 38,
    stats: "Patna • 15+ startups",
    path: "M 155 95 L 175 90 L 185 100 L 180 115 L 170 120 L 155 115 Z",
  },
  {
    id: "odisha",
    name: "Odisha",
    adoption: 45,
    stats: "Bhubaneswar • 25+ firms",
    path: "M 175 140 L 195 135 L 205 150 L 200 170 L 190 175 L 180 165 L 175 155 Z",
  },
  {
    id: "assam",
    name: "Assam",
    adoption: 35,
    stats: "Guwahati • 10+ startups",
    path: "M 210 60 L 230 55 L 240 65 L 235 80 L 220 85 L 210 75 Z",
  },
  {
    id: "goa",
    name: "Goa",
    adoption: 62,
    stats: "Panaji • 8+ AI firms",
    path: "M 105 210 L 115 208 L 120 218 L 115 225 L 105 222 Z",
  },
];

function getHeatColor(adoption: number): string {
  // Gradient from cool blue-gray to saffron to emerald
  if (adoption >= 85) return "#10b981"; // emerald - high
  if (adoption >= 75) return "#34d399"; // light emerald
  if (adoption >= 65) return "#f59e0b"; // saffron - medium
  if (adoption >= 50) return "#fbbf24"; // light saffron
  if (adoption >= 40) return "#f97316"; // orange - low-medium
  return "#78716c"; // muted - low
}

function getHeatOpacity(adoption: number): number {
  return 0.3 + (adoption / 100) * 0.55;
}

export function IndiaMapHeatmap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const hovered = REGIONS.find((r) => r.id === hoveredRegion);

  return (
    <section className="relative py-12 md:py-16">
      <div className="absolute inset-0 dot-pattern-bg-saffron" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl font-bold md:text-2xl font-[family-name:var(--font-playfair)] text-shadow-glow-saffron">
            India AI Landscape
          </h2>
          <p className="text-sm text-[#8b8b9e] mt-1">
            AI adoption readiness across major states and regions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card glass-surface noise-texture p-6 rounded-2xl max-w-3xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Map SVG */}
            <div className="relative flex-1 min-w-[280px]">
              <svg
                viewBox="40 40 220 280"
                className="w-full max-w-[400px] mx-auto"
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
              >
                <defs>
                  <radialGradient id="indiaBg" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Background */}
                <rect x="40" y="40" width="220" height="280" fill="url(#indiaBg)" rx="8" />

                {/* Regions */}
                {REGIONS.map((region, i) => (
                  <path
                    key={region.id}
                    d={region.path}
                    fill={getHeatColor(region.adoption)}
                    fillOpacity={getHeatOpacity(region.adoption)}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={0.8}
                    className="india-heat-region"
                    style={{ animationDelay: `${i * 0.05}s` }}
                    onMouseEnter={(e) => {
                      setHoveredRegion(region.id);
                      const svg = e.currentTarget.closest("svg");
                      if (svg) {
                        const rect = svg.getBoundingClientRect();
                        const pt = svg.createSVGPoint();
                        pt.x = e.clientX - rect.left;
                        pt.y = e.clientY - rect.top;
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 40 });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredRegion(null);
                      setTooltipPos(null);
                    }}
                  />
                ))}
              </svg>

              {/* Tooltip */}
              {hovered && tooltipPos && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-20 glass-card rounded-lg px-3 py-2 pointer-events-none text-left"
                  style={{
                    left: Math.min(tooltipPos.x, 200),
                    top: Math.max(tooltipPos.y, 10),
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getHeatColor(hovered.adoption) }}
                    />
                    <span className="text-xs font-semibold text-[#f5f5f7]">{hovered.name}</span>
                  </div>
                  <div className="text-[10px] text-[#8b8b9e] mt-0.5">{hovered.stats}</div>
                  <div className="text-[10px] mt-0.5">
                    <span className="text-[#8b8b9e]">AI Readiness: </span>
                    <span
                      className="font-bold"
                      style={{ color: getHeatColor(hovered.adoption) }}
                    >
                      {hovered.adoption}%
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 shrink-0">
              <div className="text-xs font-semibold text-[#f5f5f7] mb-1">AI Readiness Index</div>
              {[
                { range: "85-100", label: "Leading", color: "#10b981" },
                { range: "75-84", label: "Strong", color: "#34d399" },
                { range: "65-74", label: "Growing", color: "#f59e0b" },
                { range: "50-64", label: "Emerging", color: "#fbbf24" },
                { range: "40-49", label: "Early", color: "#f97316" },
                { range: "0-39", label: "Nascent", color: "#78716c" },
              ].map((item) => (
                <div key={item.range} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.color, opacity: 0.7 }}
                  />
                  <span className="text-[10px] text-[#8b8b9e] w-12">{item.range}</span>
                  <span className="text-[10px] text-[#c8c8d4]">{item.label}</span>
                </div>
              ))}

              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <div className="text-[10px] text-[#8b8b9e]">
                  Based on startup density, AI research output, and government policy support
                </div>
              </div>

              {/* Top regions callout */}
              <div className="mt-2 space-y-1.5">
                {REGIONS.sort((a, b) => b.adoption - a.adoption)
                  .slice(0, 3)
                  .map((r) => (
                    <div key={r.id} className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getHeatColor(r.adoption) }}
                      />
                      <span className="text-[10px] text-[#c8c8d4]">{r.name}</span>
                      <span className="text-[10px] font-medium text-[#f59e0b] ml-auto">
                        {r.adoption}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
