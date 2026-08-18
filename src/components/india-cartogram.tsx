"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, TrendingUp, Building2, Users } from "lucide-react";

/**
 * India AI Cartogram — Grid/tile-based map where each state is represented
 * as a rectangle sized proportionally to its AI ecosystem activity.
 * This gives an accurate geographic layout while using size to represent
 * the AI landscape magnitude (unlike the polygon map where size = geographic area).
 */

interface StateData {
  id: string;
  name: string;
  aiScore: number;       // 0-100 AI readiness score
  startups: number;       // AI startups count
  researchLabs: number;   // AI research labs/institutes
  policyScore: number;    // Government AI policy support 0-100
  keyCity: string;        // Primary AI hub city
  // Grid position (row, col) for cartogram layout approximating India's shape
  row: number;
  col: number;
  // Tile size: larger = more AI activity
  tileScale: number;      // 1-3, affects visual size
}

const STATES: StateData[] = [
  // North India
  { id: "jk", name: "Jammu & Kashmir", aiScore: 32, startups: 5, researchLabs: 2, policyScore: 40, keyCity: "Srinagar", row: 0, col: 1, tileScale: 1 },
  { id: "pb", name: "Punjab", aiScore: 70, startups: 50, researchLabs: 8, policyScore: 65, keyCity: "Chandigarh", row: 1, col: 1, tileScale: 1.2 },
  { id: "hr", name: "Haryana", aiScore: 75, startups: 80, researchLabs: 10, policyScore: 70, keyCity: "Gurugram", row: 1, col: 2, tileScale: 1.3 },
  { id: "dl", name: "Delhi NCR", aiScore: 88, startups: 300, researchLabs: 25, policyScore: 85, keyCity: "New Delhi", row: 2, col: 2, tileScale: 2.2 },
  { id: "up", name: "Uttar Pradesh", aiScore: 60, startups: 85, researchLabs: 12, policyScore: 55, keyCity: "Noida-Lucknow", row: 2, col: 3, tileScale: 1.6 },
  { id: "uk", name: "Uttarakhand", aiScore: 45, startups: 15, researchLabs: 4, policyScore: 50, keyCity: "Dehradun", row: 1, col: 3, tileScale: 1 },
  { id: "rj", name: "Rajasthan", aiScore: 55, startups: 45, researchLabs: 6, policyScore: 55, keyCity: "Jaipur", row: 2, col: 0, tileScale: 1.3 },

  // Central India
  { id: "mp", name: "Madhya Pradesh", aiScore: 42, startups: 30, researchLabs: 5, policyScore: 45, keyCity: "Bhopal-Indore", row: 3, col: 1, tileScale: 1.2 },
  { id: "cg", name: "Chhattisgarh", aiScore: 35, startups: 12, researchLabs: 3, policyScore: 40, keyCity: "Raipur", row: 4, col: 1, tileScale: 1 },

  // West India
  { id: "gj", name: "Gujarat", aiScore: 76, startups: 120, researchLabs: 15, policyScore: 72, keyCity: "Ahmedabad", row: 3, col: 0, tileScale: 1.5 },
  { id: "mh", name: "Maharashtra", aiScore: 92, startups: 340, researchLabs: 40, policyScore: 88, keyCity: "Mumbai-Pune", row: 4, col: 0, tileScale: 2.5 },
  { id: "go", name: "Goa", aiScore: 62, startups: 8, researchLabs: 2, policyScore: 60, keyCity: "Panaji", row: 5, col: 0, tileScale: 0.8 },

  // East India
  { id: "br", name: "Bihar", aiScore: 38, startups: 15, researchLabs: 3, policyScore: 35, keyCity: "Patna", row: 3, col: 3, tileScale: 1 },
  { id: "jh", name: "Jharkhand", aiScore: 40, startups: 18, researchLabs: 4, policyScore: 42, keyCity: "Ranchi", row: 4, col: 2, tileScale: 1 },
  { id: "wb", name: "West Bengal", aiScore: 72, startups: 90, researchLabs: 18, policyScore: 68, keyCity: "Kolkata", row: 3, col: 4, tileScale: 1.5 },
  { id: "od", name: "Odisha", aiScore: 45, startups: 25, researchLabs: 5, policyScore: 48, keyCity: "Bhubaneswar", row: 4, col: 3, tileScale: 1.1 },

  // North East
  { id: "as", name: "Assam", aiScore: 35, startups: 10, researchLabs: 3, policyScore: 38, keyCity: "Guwahati", row: 2, col: 5, tileScale: 1 },
  { id: "ne", name: "NE States", aiScore: 28, startups: 8, researchLabs: 2, policyScore: 32, keyCity: "Shillong", row: 1, col: 5, tileScale: 0.8 },

  // South India
  { id: "ts", name: "Telangana", aiScore: 82, startups: 180, researchLabs: 20, policyScore: 80, keyCity: "Hyderabad", row: 5, col: 2, tileScale: 1.8 },
  { id: "ka", name: "Karnataka", aiScore: 89, startups: 450, researchLabs: 35, policyScore: 85, keyCity: "Bengaluru", row: 6, col: 1, tileScale: 2.5 },
  { id: "ap", name: "Andhra Pradesh", aiScore: 65, startups: 55, researchLabs: 8, policyScore: 60, keyCity: "Visakhapatnam", row: 6, col: 2, tileScale: 1.2 },
  { id: "tn", name: "Tamil Nadu", aiScore: 85, startups: 200, researchLabs: 22, policyScore: 78, keyCity: "Chennai", row: 7, col: 2, tileScale: 2 },
  { id: "kl", name: "Kerala", aiScore: 78, startups: 60, researchLabs: 10, policyScore: 75, keyCity: "Kochi-Thiruvananthapuram", row: 7, col: 1, tileScale: 1.3 },
];

function getHeatColor(score: number): string {
  if (score >= 85) return "#10b981";
  if (score >= 75) return "#34d399";
  if (score >= 65) return "#f59e0b";
  if (score >= 50) return "#fbbf24";
  if (score >= 40) return "#f97316";
  return "#78716c";
}

function getHeatLabel(score: number): string {
  if (score >= 85) return "Leading";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Growing";
  if (score >= 50) return "Emerging";
  if (score >= 40) return "Early";
  return "Nascent";
}

export function IndiaCartogram() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const hovered = STATES.find((s) => s.id === hoveredState);
  const selected = STATES.find((s) => s.id === selectedState);

  // Compute grid dimensions
  const maxRow = Math.max(...STATES.map((s) => s.row));
  const maxCol = Math.max(...STATES.map((s) => s.col));

  // Top 5 states for the sidebar
  const topStates = [...STATES].sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 dot-pattern-bg-saffron" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)] text-shadow-glow-saffron">
            India AI Landscape
          </h2>
          <p className="text-xs sm:text-sm text-[#8b8b9e] mt-1.5 max-w-xl mx-auto">
            State-level AI readiness — tile size represents ecosystem scale,
            color indicates maturity level
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card glass-surface p-4 sm:p-6 rounded-2xl max-w-5xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Cartogram Grid */}
            <div className="flex-1 min-w-0">
              <div
                className="grid gap-1.5 sm:gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${maxRow + 1}, minmax(0, 1fr))`,
                  maxWidth: "600px",
                  aspectRatio: `${(maxCol + 1) / (maxRow + 1)}`,
                }}
              >
                {STATES.map((state, i) => {
                  const color = getHeatColor(state.aiScore);
                  const isHovered = hoveredState === state.id;
                  const isSelected = selectedState === state.id;
                  const opacity = 0.35 + (state.aiScore / 100) * 0.5;

                  return (
                    <motion.div
                      key={state.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                      style={{
                        gridColumn: state.col + 1,
                        gridRow: state.row + 1,
                      }}
                      className="relative"
                    >
                      <motion.button
                        whileHover={{ scale: 1.08, zIndex: 20 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setHoveredState(state.id)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => setSelectedState(isSelected ? null : state.id)}
                        className={`w-full h-full rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-1 sm:p-2 border ${
                          isSelected
                            ? "border-white/30 shadow-lg"
                            : isHovered
                            ? "border-white/20"
                            : "border-white/5"
                        }`}
                        style={{
                          backgroundColor: `${color}`,
                          opacity: isHovered || isSelected ? 1 : opacity,
                          minHeight: `${state.tileScale * 40}px`,
                          aspectRatio: "auto",
                        }}
                      >
                        {/* State abbreviation */}
                        <span className="text-[9px] sm:text-[10px] font-bold text-white/90 leading-none">
                          {state.id.toUpperCase().slice(0, 2)}
                        </span>
                        {/* Score */}
                        <span className="text-[7px] sm:text-[8px] text-white/70 mt-0.5 leading-none">
                          {state.aiScore}
                        </span>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Hover tooltip */}
              <AnimatePresence>
                {hovered && !selectedState && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-3 glass-card rounded-xl p-3 sm:p-4 text-left max-w-md mx-auto"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getHeatColor(hovered.aiScore) }}
                      />
                      <span className="text-sm font-semibold text-[#f5f5f7]">{hovered.name}</span>
                      <span
                        className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getHeatColor(hovered.aiScore)}15`,
                          color: getHeatColor(hovered.aiScore),
                          border: `1px solid ${getHeatColor(hovered.aiScore)}30`,
                        }}
                      >
                        {getHeatLabel(hovered.aiScore)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                        <Building2 className="h-3 w-3" style={{ color: "#f59e0b" }} />
                        <span>{hovered.startups} startups</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                        <Users className="h-3 w-3" style={{ color: "#10b981" }} />
                        <span>{hovered.researchLabs} labs</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                        <MapPin className="h-3 w-3" style={{ color: "#8b5cf6" }} />
                        <span>{hovered.keyCity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                        <TrendingUp className="h-3 w-3" style={{ color: "#f97316" }} />
                        <span>Policy: {hovered.policyScore}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right sidebar - Legend + Top states + Selected detail */}
            <div className="flex flex-col gap-4 shrink-0 lg:w-56 xl:w-64">
              {/* Legend */}
              <div>
                <div className="text-xs font-semibold text-[#f5f5f7] mb-2">AI Readiness Index</div>
                <div className="space-y-1.5">
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
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color, opacity: 0.7 }}
                      />
                      <span className="text-[10px] text-[#8b8b9e] w-10 shrink-0">{item.range}</span>
                      <span className="text-[10px] text-[#c8c8d4]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top States */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <div className="text-xs font-semibold text-[#f5f5f7] mb-2">Top AI Hubs</div>
                <div className="space-y-2">
                  {topStates.map((state, i) => (
                    <div
                      key={state.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] rounded-lg px-1.5 py-1 transition-colors"
                      onClick={() => setSelectedState(selectedState === state.id ? null : state.id)}
                    >
                      <span className="text-[10px] font-bold text-[#55556a] w-4">#{i + 1}</span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: getHeatColor(state.aiScore) }}
                      />
                      <span className="text-[11px] text-[#c8c8d4] truncate">{state.name}</span>
                      <span
                        className="ml-auto text-[10px] font-medium shrink-0"
                        style={{ color: getHeatColor(state.aiScore) }}
                      >
                        {state.aiScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected state detail panel */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-[rgba(255,255,255,0.06)] overflow-hidden"
                  >
                    <div className="text-xs font-semibold text-[#f5f5f7] mb-2 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: getHeatColor(selected.aiScore) }}
                      />
                      {selected.name}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b8b9e]">AI Score</span>
                        <span className="font-medium" style={{ color: getHeatColor(selected.aiScore) }}>{selected.aiScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b8b9e]">Startups</span>
                        <span className="text-[#f5f5f7]">{selected.startups}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b8b9e]">Research Labs</span>
                        <span className="text-[#f5f5f7]">{selected.researchLabs}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b8b9e]">Policy Support</span>
                        <span className="text-[#f5f5f7]">{selected.policyScore}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b8b9e]">Key City</span>
                        <span className="text-[#f5f5f7]">{selected.keyCity}</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selected.aiScore}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: getHeatColor(selected.aiScore) }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Methodology note */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <div className="text-[10px] text-[#55556a] leading-relaxed">
                  Based on AI startup density, research output, government policy support,
                  and industry adoption data. Tile size reflects ecosystem scale.
                </div>
              </div>
            </div>
          </div>

          {/* Summary stats bar */}
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "States Covered", value: STATES.length, color: "#f59e0b" },
              { label: "Total AI Startups", value: STATES.reduce((s, st) => s + st.startups, 0), color: "#10b981" },
              { label: "Research Labs", value: STATES.reduce((s, st) => s + st.researchLabs, 0), color: "#8b5cf6" },
              { label: "Avg AI Score", value: Math.round(STATES.reduce((s, st) => s + st.aiScore, 0) / STATES.length), color: "#f97316" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg sm:text-xl font-bold font-[family-name:var(--font-geist-mono)]" style={{ color: stat.color }}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#55556a] uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
