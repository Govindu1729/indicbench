"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AXES = ["Legal", "Healthcare", "Fintech", "Vernacular", "Education"] as const;
const AXES_KEYS = ["legal", "healthcare", "fintech", "vernacular", "education"] as const;
type AxisKey = (typeof AXES_KEYS)[number];

const AXIS_COLORS: Record<AxisKey, string> = {
  legal: "#f59e0b",
  healthcare: "#10b981",
  fintech: "#60a5fa",
  vernacular: "#a78bfa",
  education: "#f97316",
};

interface CategoryScores {
  legal?: number;
  healthcare?: number;
  fintech?: number;
  vernacular?: number;
  education?: number;
}

interface ModelRadarChartProps {
  modelName: string;
  scores: CategoryScores;
  comparisonModel?: {
    name: string;
    scores: CategoryScores;
  };
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function getPolygonPoints(
  scores: CategoryScores,
  cx: number,
  cy: number,
  maxR: number,
  scale: number = 1
): string {
  const numAxes = AXES.length;
  return AXES_KEYS.map((key, i) => {
    const angle = (360 / numAxes) * i;
    const value = (scores[key] ?? 0) / 100;
    const r = maxR * value * scale;
    const point = polarToCartesian(cx, cy, r, angle);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function getAxisEndpoint(cx: number, cy: number, r: number, index: number) {
  const numAxes = AXES.length;
  const angle = (360 / numAxes) * index;
  return polarToCartesian(cx, cy, r, angle);
}

export function ModelRadarChart({
  modelName,
  scores,
  comparisonModel,
  size = 280,
}: ModelRadarChartProps) {
  const [animateScale, setAnimateScale] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateScale(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 40; // leave room for labels
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="glass-card p-4 flex flex-col items-center">
      <div className="text-xs font-semibold text-[#8b8b9e] mb-2 text-center">
        {modelName}
        {comparisonModel && (
          <span className="text-[#55556a]"> vs {comparisonModel.name}</span>
        )}
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="select-none"
      >
        <defs>
          <linearGradient id="radar-fill-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="radar-fill-compare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Grid circles */}
        {gridLevels.map((level) => {
          const r = maxR * (level / 100);
          return (
            <circle
              key={level}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              className="radar-grid-line"
            />
          );
        })}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const end = getAxisEndpoint(cx, cy, maxR, i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              className="radar-axis-line"
            />
          );
        })}

        {/* Grid level labels */}
        {gridLevels.map((level) => {
          const labelPos = polarToCartesian(cx, cy, maxR * (level / 100), 0);
          return (
            <text
              key={`label-${level}`}
              x={labelPos.x + 4}
              y={labelPos.y - 2}
              fill="rgba(255,255,255,0.2)"
              fontSize="8"
              fontFamily="var(--font-geist-mono)"
            >
              {level}
            </text>
          );
        })}

        {/* Comparison model polygon (behind main) */}
        {comparisonModel && (
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            points={getPolygonPoints(
              comparisonModel.scores,
              cx,
              cy,
              maxR,
              animateScale
            )}
            fill="url(#radar-fill-compare)"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        )}

        {/* Main model polygon */}
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          points={getPolygonPoints(scores, cx, cy, maxR, animateScale)}
          fill="url(#radar-fill-grad)"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* Data points on main polygon */}
        {AXES_KEYS.map((key, i) => {
          const angle = (360 / AXES.length) * i;
          const value = (scores[key] ?? 0) / 100;
          const r = maxR * value * animateScale;
          const point = polarToCartesian(cx, cy, r, angle);
          return (
            <motion.circle
              key={`dot-${key}`}
              initial={{ r: 0 }}
              animate={{ r: 3 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              cx={point.x}
              cy={point.y}
              fill={AXIS_COLORS[key]}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis labels */}
        {AXES.map((label, i) => {
          const end = getAxisEndpoint(cx, cy, maxR + 22, i);
          const anchor =
            i === 0 ? "middle" : i < AXES.length / 2 ? "start" : i > AXES.length / 2 ? "end" : "middle";
          return (
            <text
              key={`axis-${label}`}
              x={end.x}
              y={end.y}
              textAnchor={anchor}
              dominantBaseline="central"
              fill={AXIS_COLORS[AXES_KEYS[i]]}
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-geist-sans)"
            >
              {label}
            </text>
          );
        })}

        {/* Score values near each vertex */}
        {AXES_KEYS.map((key, i) => {
          const angle = (360 / AXES.length) * i;
          const value = (scores[key] ?? 0) / 100;
          const r = maxR * value * animateScale;
          const point = polarToCartesian(cx, cy, r, angle);
          // Offset slightly outward
          const labelPt = polarToCartesian(cx, cy, r + 12, angle);
          return (
            <motion.text
              key={`score-${key}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#f5f5f7"
              fontSize="9"
              fontWeight="700"
              fontFamily="var(--font-geist-mono)"
            >
              {(scores[key] ?? 0).toFixed(0)}
            </motion.text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981]" />
          <span className="text-[10px] text-[#8b8b9e]">{modelName}</span>
        </div>
        {comparisonModel && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#60a5fa]" />
            <span className="text-[10px] text-[#8b8b9e]">{comparisonModel.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
