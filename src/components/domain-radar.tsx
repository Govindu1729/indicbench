"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DOMAINS = [
  { key: "legal", label: "Legal", icon: "⚖️" },
  { key: "finance", label: "Finance", icon: "💰" },
  { key: "healthcare", label: "Healthcare", icon: "🏥" },
  { key: "vernacular", label: "Vernacular", icon: "🗣️" },
  { key: "education", label: "Education", icon: "📚" },
];

// Fictional but realistic domain scores for each model
const MODEL_SCORES: Record<string, Record<string, number>> = {
  "Claude Opus 4": { legal: 92, finance: 88, healthcare: 84, vernacular: 79, education: 86 },
  "GPT-4o": { legal: 87, finance: 86, healthcare: 85, vernacular: 82, education: 83 },
  "Gemini 2.5 Pro": { legal: 82, finance: 80, healthcare: 78, vernacular: 90, education: 91 },
  "Llama 3.1 405B": { legal: 78, finance: 82, healthcare: 76, vernacular: 72, education: 80 },
  "Mixtral 8x22B": { legal: 74, finance: 77, healthcare: 71, vernacular: 68, education: 73 },
};

const MODEL_COLORS: Record<string, { fill: string; stroke: string; dot: string }> = {
  "Claude Opus 4": { fill: "rgba(245,158,11,0.15)", stroke: "#f59e0b", dot: "#f59e0b" },
  "GPT-4o": { fill: "rgba(16,185,129,0.15)", stroke: "#10b981", dot: "#10b981" },
  "Gemini 2.5 Pro": { fill: "rgba(59,130,246,0.15)", stroke: "#3b82f6", dot: "#3b82f6" },
  "Llama 3.1 405B": { fill: "rgba(249,115,22,0.15)", stroke: "#f97316", dot: "#f97316" },
  "Mixtral 8x22B": { fill: "rgba(139,139,158,0.15)", stroke: "#8b8b9e", dot: "#8b8b9e" },
};

const SIZE = 300;
const CENTER = SIZE / 2;
const MAX_RADIUS = 110;

function polarToCartesian(angle: number, radius: number) {
  return {
    x: CENTER + radius * Math.cos(angle - Math.PI / 2),
    y: CENTER + radius * Math.sin(angle - Math.PI / 2),
  };
}

function getPolygonPoints(scores: Record<string, number>, animProgress: number) {
  return DOMAINS.map((domain, i) => {
    const angle = (2 * Math.PI * i) / DOMAINS.length;
    const score = (scores[domain.key] ?? 0) / 100;
    const r = MAX_RADIUS * score * animProgress;
    return polarToCartesian(angle, r);
  });
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

interface DomainRadarProps {
  modelsData?: { models?: Array<{ id: string; name: string }> } | null;
  isLoading?: boolean;
}

export function DomainRadar({ modelsData, isLoading }: DomainRadarProps) {
  const [primaryModel, setPrimaryModel] = useState("Claude Opus 4");
  const [compareModel, setCompareModel] = useState<string | null>(null);
  const [highlightDomain, setHighlightDomain] = useState<string | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const modelNames = Object.keys(MODEL_SCORES);

  const primaryScores = MODEL_SCORES[primaryModel] ?? MODEL_SCORES["Claude Opus 4"];
  const compareScores = compareModel ? MODEL_SCORES[compareModel] : null;

  const primaryPoints = useMemo(
    () => getPolygonPoints(primaryScores, animProgress),
    [primaryScores, animProgress]
  );
  const comparePoints = useMemo(
    () => (compareScores ? getPolygonPoints(compareScores, animProgress) : null),
    [compareScores, animProgress]
  );

  // Animate on mount
  const handleEnter = () => {
    let start: number | null = null;
    const duration = 800;
    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      setAnimProgress(1 - Math.pow(1 - progress, 3));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  return (
    <section className="relative py-12 md:py-16">
      <div className="absolute inset-0 dot-pattern-bg" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl font-bold md:text-2xl font-[family-name:var(--font-playfair)] text-shadow-glow-saffron">
            Domain Radar
          </h2>
          <p className="text-sm text-[#8b8b9e] mt-1">
            Model performance across 5 Indian domains
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="shimmer-premium glass-card rounded-2xl w-full max-w-2xl h-64" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onViewportEnter={handleEnter}
            transition={{ duration: 0.5 }}
            className="glass-card glass-surface noise-texture p-6 rounded-2xl max-w-3xl mx-auto"
          >
            {/* Model selectors */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b8b9e]">Primary:</span>
                <select
                  value={primaryModel}
                  onChange={(e) => setPrimaryModel(e.target.value)}
                  className="glass-card rounded-lg px-3 py-1.5 text-sm text-[#f5f5f7] border border-[rgba(255,255,255,0.1)] bg-transparent outline-none focus:border-[#f59e0b]"
                >
                  {modelNames.map((name) => (
                    <option key={name} value={name} className="bg-[#111118] text-[#f5f5f7]">
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b8b9e]">Compare:</span>
                <select
                  value={compareModel ?? ""}
                  onChange={(e) => setCompareModel(e.target.value || null)}
                  className="glass-card rounded-lg px-3 py-1.5 text-sm text-[#f5f5f7] border border-[rgba(255,255,255,0.1)] bg-transparent outline-none focus:border-[#10b981]"
                >
                  <option value="" className="bg-[#111118] text-[#f5f5f7]">
                    None
                  </option>
                  {modelNames
                    .filter((n) => n !== primaryModel)
                    .map((name) => (
                      <option key={name} value={name} className="bg-[#111118] text-[#f5f5f7]">
                        {name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* SVG Radar Chart */}
            <div className="flex justify-center">
              <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="overflow-visible"
              >
                <defs>
                  <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(245,158,11,0.04)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Background glow */}
                <circle cx={CENTER} cy={CENTER} r={MAX_RADIUS} fill="url(#radarGlow)" />

                {/* Grid rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
                  <circle
                    key={scale}
                    cx={CENTER}
                    cy={CENTER}
                    r={MAX_RADIUS * scale}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                  />
                ))}

                {/* Axis lines & labels */}
                {DOMAINS.map((domain, i) => {
                  const angle = (2 * Math.PI * i) / DOMAINS.length;
                  const end = polarToCartesian(angle, MAX_RADIUS);
                  const labelPos = polarToCartesian(angle, MAX_RADIUS + 22);
                  const isHighlighted = highlightDomain === domain.key;

                  return (
                    <g key={domain.key}>
                      <line
                        x1={CENTER}
                        y1={CENTER}
                        x2={end.x}
                        y2={end.y}
                        stroke={isHighlighted ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}
                        strokeWidth={isHighlighted ? 1.5 : 1}
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[10px] fill-[#8b8b9e] select-none"
                        style={{ fontSize: 10 }}
                      >
                        {domain.icon} {domain.label}
                      </text>
                    </g>
                  );
                })}

                {/* Compare polygon (behind primary) */}
                {comparePoints && compareModel && (
                  <motion.polygon
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    points={pointsToString(comparePoints)}
                    fill={MODEL_COLORS[compareModel]?.fill ?? "rgba(16,185,129,0.1)"}
                    stroke={MODEL_COLORS[compareModel]?.stroke ?? "#10b981"}
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                )}

                {/* Primary polygon */}
                <polygon
                  points={pointsToString(primaryPoints)}
                  fill={MODEL_COLORS[primaryModel]?.fill ?? "rgba(245,158,11,0.1)"}
                  stroke={MODEL_COLORS[primaryModel]?.stroke ?? "#f59e0b"}
                  strokeWidth={2}
                  className="radar-polygon-animate"
                />

                {/* Vertex dots & scores */}
                {DOMAINS.map((domain, i) => {
                  const pt = primaryPoints[i];
                  const score = primaryScores[domain.key] ?? 0;
                  const isHighlighted = highlightDomain === domain.key;

                  return (
                    <g
                      key={`dot-${domain.key}`}
                      onClick={() =>
                        setHighlightDomain(highlightDomain === domain.key ? null : domain.key)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {/* Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHighlighted ? 5 : 3.5}
                        fill={MODEL_COLORS[primaryModel]?.dot ?? "#f59e0b"}
                        stroke="rgba(10,10,15,0.8)"
                        strokeWidth={1.5}
                        className="transition-all duration-200"
                      />
                      {/* Score label */}
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`select-none transition-all duration-200 ${
                          isHighlighted ? "fill-[#f59e0b] font-bold" : "fill-[#c8c8d4]"
                        }`}
                        style={{ fontSize: isHighlighted ? 11 : 9 }}
                      >
                        {score}
                      </text>
                    </g>
                  );
                })}

                {/* Compare dots */}
                {comparePoints &&
                  compareModel &&
                  DOMAINS.map((domain, i) => {
                    const pt = comparePoints[i];
                    const score = compareScores?.[domain.key] ?? 0;
                    return (
                      <g key={`cmp-dot-${domain.key}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={2.5}
                          fill={MODEL_COLORS[compareModel]?.dot ?? "#10b981"}
                          stroke="rgba(10,10,15,0.8)"
                          strokeWidth={1}
                        />
                        <text
                          x={pt.x}
                          y={pt.y + 12}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="select-none fill-[#8b8b9e]"
                          style={{ fontSize: 8 }}
                        >
                          {score}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>

            {/* Domain highlight detail */}
            <AnimatePresence>
              {highlightDomain && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-lg mb-1">
                      {DOMAINS.find((d) => d.key === highlightDomain)?.icon}{" "}
                      <span className="text-sm font-semibold text-[#f5f5f7]">
                        {DOMAINS.find((d) => d.key === highlightDomain)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <span className="text-[#f59e0b] font-medium">
                        {primaryModel}: {primaryScores[highlightDomain]}
                      </span>
                      {compareModel && compareScores && (
                        <span className="text-[#10b981] font-medium">
                          {compareModel}: {compareScores[highlightDomain]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8b8b9e] mt-2">
                      Click a vertex again to deselect
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: MODEL_COLORS[primaryModel]?.dot ?? "#f59e0b" }}
                />
                <span className="text-xs text-[#8b8b9e]">{primaryModel}</span>
              </div>
              {compareModel && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-dashed"
                    style={{
                      borderColor: MODEL_COLORS[compareModel]?.stroke ?? "#10b981",
                      backgroundColor: "transparent",
                    }}
                  />
                  <span className="text-xs text-[#8b8b9e]">{compareModel}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
