"use client";

import { useMemo } from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

/* ===== Types ===== */
interface ScoreContextTooltipProps {
  score: number;
  allScores: number[];
  categoryScores?: Record<string, number>;
  categoryNameMap?: Record<string, string>;
  categoryColorMap?: Record<string, string>;
  modelRank?: number;
  totalModels?: number;
  accuracy?: number | null;
  f1Score?: number | null;
  children: React.ReactNode;
}

const DEFAULT_CATEGORY_NAME_MAP: Record<string, string> = {
  legal: "Legal",
  healthcare: "Health",
  fintech: "Fintech",
  vernacular: "Vernac.",
  education: "Edu.",
};

const DEFAULT_CATEGORY_COLOR_MAP: Record<string, string> = {
  legal: "#f59e0b",
  healthcare: "#10b981",
  fintech: "#60a5fa",
  vernacular: "#a78bfa",
  education: "#f97316",
};

/* ===== Percentile rank ===== */
function computePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 100;
  const below = allScores.filter((s) => s < score).length;
  return Math.round((below / allScores.length) * 100);
}

/* ===== Bell curve indicator (CSS-based) ===== */
function MiniBellCurve({ score, mean, stdDev }: { score: number; mean: number; stdDev: number }) {
  // Create a simplified distribution visualization with 20 bars
  const numBars = 20;
  const minVal = Math.max(0, mean - 3 * stdDev);
  const maxVal = Math.min(100, mean + 3 * stdDev);
  const range = maxVal - minVal || 1;
  const barWidth = range / numBars;

  // Generate bar heights from Gaussian
  const bars: { height: number; isScoreBar: boolean }[] = [];
  let maxGaussian = 0;
  const gaussians: number[] = [];
  for (let i = 0; i < numBars; i++) {
    const x = minVal + i * barWidth + barWidth / 2;
    const g = Math.exp(-0.5 * ((x - mean) / (stdDev || 1)) ** 2);
    gaussians.push(g);
    if (g > maxGaussian) maxGaussian = g;
  }
  for (let i = 0; i < numBars; i++) {
    const x = minVal + i * barWidth + barWidth / 2;
    const normalizedHeight = maxGaussian > 0 ? gaussians[i] / maxGaussian : 0;
    const isScoreBar = x >= score - barWidth / 2 && x < score + barWidth / 2;
    bars.push({ height: normalizedHeight, isScoreBar });
  }

  return (
    <div className="flex items-end gap-px h-6">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-[3px] rounded-t-sm transition-all"
          style={{
            height: `${Math.max(2, bar.height * 100)}%`,
            backgroundColor: bar.isScoreBar ? "#f59e0b" : "rgba(255,255,255,0.08)",
          }}
        />
      ))}
    </div>
  );
}

export function ScoreContextTooltip({
  score,
  allScores,
  categoryScores,
  categoryNameMap = DEFAULT_CATEGORY_NAME_MAP,
  categoryColorMap = DEFAULT_CATEGORY_COLOR_MAP,
  modelRank,
  totalModels,
  accuracy,
  f1Score,
  children,
}: ScoreContextTooltipProps) {
  // Compute stats
  const { percentile, mean, stdDev, diffFromAvg } = useMemo(() => {
    if (allScores.length === 0) {
      return { percentile: 100, mean: score, stdDev: 0, diffFromAvg: 0 };
    }
    const pct = computePercentile(score, allScores);
    const m = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const variance = allScores.reduce((sum, s) => sum + (s - m) ** 2, 0) / allScores.length;
    const sd = Math.sqrt(variance);
    return {
      percentile: pct,
      mean: m,
      stdDev: sd,
      diffFromAvg: score - m,
    };
  }, [score, allScores]);

  // Category entries sorted
  const categoryEntries = useMemo(() => {
    if (!categoryScores) return [];
    return Object.entries(categoryScores)
      .filter(([, v]) => v != null)
      .sort(([, a], [, b]) => (b as number) - (a as number));
  }, [categoryScores]);

  // Percentile label
  const percentileLabel = percentile >= 90 ? "Elite" : percentile >= 75 ? "Top Quartile" : percentile >= 50 ? "Above Median" : "Below Median";
  const percentileColor = percentile >= 90 ? "#fbbf24" : percentile >= 75 ? "#10b981" : percentile >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="bg-[#111118] border border-[rgba(255,255,255,0.08)] text-[#f5f5f7] rounded-xl p-3 shadow-xl w-[260px] z-50"
      >
        <div className="space-y-3">
          {/* Percentile Rank */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#55556a] uppercase tracking-wider font-medium">Percentile Rank</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color: percentileColor }}>
                Top {100 - percentile}%
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${percentileColor}15`, color: percentileColor, border: `1px solid ${percentileColor}30` }}>
                {percentileLabel}
              </span>
            </div>
          </div>

          {/* Comparison to average */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b8b9e]">vs Average</span>
            <span className={`font-[family-name:var(--font-geist-mono)] tabular-nums font-medium ${diffFromAvg > 0 ? "text-[#10b981]" : diffFromAvg < 0 ? "text-[#ef4444]" : "text-[#55556a]"}`}>
              {diffFromAvg > 0 ? "+" : ""}{diffFromAvg.toFixed(1)} pts
              {diffFromAvg > 0 ? " above" : diffFromAvg < 0 ? " below" : " at"} avg
            </span>
          </div>

          {/* Mini Distribution Chart */}
          <div>
            <span className="text-[9px] text-[#55556a] uppercase tracking-wider font-medium">Score Distribution</span>
            <div className="mt-1 flex items-end gap-1">
              <MiniBellCurve score={score} mean={mean} stdDev={stdDev} />
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[8px] text-[#55556a] font-[family-name:var(--font-geist-mono)] tabular-nums">
              <span>{Math.round(Math.max(0, mean - 3 * stdDev))}</span>
              <span className="text-[#f59e0b]">▲ {score.toFixed(0)}</span>
              <span>{Math.round(Math.min(100, mean + 3 * stdDev))}</span>
            </div>
          </div>

          {/* Category breakdown mini-bars */}
          {categoryEntries.length > 0 && (
            <div>
              <span className="text-[9px] text-[#55556a] uppercase tracking-wider font-medium">Category Breakdown</span>
              <div className="mt-1.5 space-y-1">
                {categoryEntries.map(([key, value]) => {
                  const val = value as number;
                  const color = categoryColorMap[key] || "#8b8b9e";
                  const name = categoryNameMap[key] || key;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-12 text-[9px] text-[#8b8b9e] truncate">{name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${val}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }}
                        />
                      </div>
                      <span className="text-[9px] font-[family-name:var(--font-geist-mono)] tabular-nums w-7 text-right" style={{ color }}>
                        {val.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accuracy / F1 — real data only */}
          {(accuracy != null || f1Score != null) && (
            <div className="flex items-center justify-between text-[10px] text-[#55556a] pt-1 border-t border-[rgba(255,255,255,0.04)]">
              <div className="flex gap-3">
                <span>Accuracy</span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]">
                  {accuracy != null ? `${(accuracy * 100).toFixed(1)}%` : "\u2014"}
                </span>
              </div>
              <div className="flex gap-3">
                <span>F1</span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]">
                  {f1Score != null ? f1Score.toFixed(3) : "\u2014"}
                </span>
              </div>
            </div>
          )}

          {/* Rank info */}
          {modelRank != null && totalModels != null && (
            <div className="flex items-center justify-between text-[10px] text-[#55556a] pt-1 border-t border-[rgba(255,255,255,0.04)]">
              <span>Overall Rank</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]">#{modelRank} of {totalModels}</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
