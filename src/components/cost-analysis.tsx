"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, ArrowUpDown, IndianRupee, Sparkles } from "lucide-react";
import type { ModelsResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface CostAnalysisProps {
  modelsData: ModelsResponse | null;
  isLoading?: boolean;
}

type CostMode = "perQuery" | "perCorrectAnswer";

export function CostAnalysis({ modelsData, isLoading }: CostAnalysisProps) {
  const [mode, setMode] = useState<CostMode>("perQuery");

  const analysis = useMemo(() => {
    const models = modelsData?.models ?? [];
    if (models.length === 0) return null;

    const modelsWithCost = models.filter(
      (m) => (m.avgCostUsd ?? 0) > 0 && m.overallScore > 0
    );

    if (modelsWithCost.length === 0) return null;

    // Best value: highest score per dollar
    const bestValue = modelsWithCost.reduce((best, m) => {
      const bestRatio = best.overallScore / (best.avgCostUsd ?? Infinity);
      const mRatio = m.overallScore / (m.avgCostUsd ?? Infinity);
      return mRatio > bestRatio ? m : best;
    }, modelsWithCost[0]);

    // Most expensive
    const mostExpensive = modelsWithCost.reduce((exp, m) => {
      return (m.avgCostUsd ?? 0) > (exp.avgCostUsd ?? 0) ? m : exp;
    }, modelsWithCost[0]);

    // Cost range
    const costs = modelsWithCost.map((m) => m.avgCostUsd ?? 0);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);

    // Per-model cost data for chart
    const chartData = modelsWithCost
      .map((m) => {
        const cost = m.avgCostUsd ?? 0;
        const score = m.overallScore;
        const costPerCorrectAnswer = score > 0 ? cost / (score / 100) : Infinity;
        return {
          name: m.name,
          provider: m.provider,
          cost,
          score,
          costPerQuery: cost,
          costPerCorrectAnswer,
          valueRatio: score / cost,
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      bestValue: {
        name: bestValue.name,
        provider: bestValue.provider,
        ratio: bestValue.overallScore / (bestValue.avgCostUsd ?? 1),
        score: bestValue.overallScore,
        cost: bestValue.avgCostUsd ?? 0,
      },
      mostExpensive: {
        name: mostExpensive.name,
        provider: mostExpensive.provider,
        cost: mostExpensive.avgCostUsd ?? 0,
        score: mostExpensive.overallScore,
      },
      costRange: { min: minCost, max: maxCost },
      chartData,
    };
  }, [modelsData]);

  if (isLoading || !analysis) {
    return (
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="glass-card p-6 h-40 rounded-xl bg-[rgba(255,255,255,0.03)]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const maxCostForChart =
    mode === "perQuery"
      ? Math.max(...analysis.chartData.map((d) => d.costPerQuery))
      : Math.max(...analysis.chartData.map((d) => d.costPerCorrectAnswer));

  return (
    <section className="relative py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-2 text-center"
        >
          <span className="section-label">
            <DollarSign className="h-3 w-3" />
            Economics
          </span>
        </motion.div>
        <div className="relative mb-2 text-center">
          <SectionNumber number="10" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Cost Analysis Dashboard
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Evaluate cost-efficiency across AI models for Indian language benchmarks
        </motion.p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Best Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0 }}
            className="glass-card glass-card-gradient-border glass-card-hover p-5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-3xl pointer-events-none bg-[#10b98115]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b98115] text-[#10b981]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs text-[#8b8b9e] uppercase tracking-wider">
                  Best Value Model
                </span>
              </div>
              <div className="text-xl font-bold text-[#f5f5f7] font-[family-name:var(--font-geist-mono)]">
                {analysis.bestValue.name}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#10b981] font-[family-name:var(--font-geist-mono)] tabular-nums">
                  {analysis.bestValue.ratio.toFixed(1)}
                </span>
                <span className="text-xs text-[#8b8b9e]">score/$</span>
              </div>
              <div className="mt-2 text-[11px] text-[#55556a]">
                {analysis.bestValue.score.toFixed(1)} avg score · $
                {analysis.bestValue.cost.toFixed(4)} per query
              </div>
            </div>
          </motion.div>

          {/* Most Expensive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card glass-card-gradient-border glass-card-hover p-5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-3xl pointer-events-none bg-[#f9731615]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f9731615] text-[#f97316]">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <span className="text-xs text-[#8b8b9e] uppercase tracking-wider">
                  Most Expensive
                </span>
              </div>
              <div className="text-xl font-bold text-[#f5f5f7] font-[family-name:var(--font-geist-mono)]">
                {analysis.mostExpensive.name}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#f97316] font-[family-name:var(--font-geist-mono)] tabular-nums">
                  ${analysis.mostExpensive.cost.toFixed(4)}
                </span>
                <span className="text-xs text-[#8b8b9e]">/query</span>
              </div>
              <div className="mt-2 text-[11px] text-[#55556a]">
                {analysis.mostExpensive.score.toFixed(1)} avg score
              </div>
            </div>
          </motion.div>

          {/* Cost Range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card glass-card-gradient-border glass-card-hover p-5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-3xl pointer-events-none bg-[#f59e0b15]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f59e0b15] text-[#f59e0b]">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <span className="text-xs text-[#8b8b9e] uppercase tracking-wider">
                  Cost Range
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-[#10b981] font-[family-name:var(--font-geist-mono)] tabular-nums">
                  ${analysis.costRange.min.toFixed(4)}
                </span>
                <span className="text-xs text-[#55556a]">—</span>
                <span className="text-lg font-bold text-[#f97316] font-[family-name:var(--font-geist-mono)] tabular-nums">
                  ${analysis.costRange.max.toFixed(4)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#55556a]">
                {(analysis.costRange.max / analysis.costRange.min).toFixed(1)}×
                spread between cheapest & priciest
              </div>
              {/* Visual range bar */}
              <div className="mt-3 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#f97316]"
                  style={{
                    width: `${Math.min(100, (analysis.costRange.min / analysis.costRange.max) * 100 + 30)}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setMode("perQuery")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "perQuery"
                ? "bg-[#10b98120] text-[#10b981] border border-[#10b98140]"
                : "text-[#8b8b9e] hover:text-[#f5f5f7] border border-transparent"
            }`}
          >
            Cost per Query
          </button>
          <button
            onClick={() => setMode("perCorrectAnswer")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "perCorrectAnswer"
                ? "bg-[#f59e0b20] text-[#f59e0b] border border-[#f59e0b40]"
                : "text-[#8b8b9e] hover:text-[#f5f5f7] border border-transparent"
            }`}
          >
            Cost per Correct Answer
          </button>
          <ArrowUpDown className="h-4 w-4 text-[#55556a] ml-2" />
        </div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="space-y-3">
            {analysis.chartData.map((item, idx) => {
              const costValue =
                mode === "perQuery"
                  ? item.costPerQuery
                  : item.costPerCorrectAnswer;
              const costPct = maxCostForChart > 0 ? (costValue / maxCostForChart) * 100 : 0;
              const scorePct = item.score;
              const barColor =
                idx === 0
                  ? "#10b981"
                  : idx === 1
                    ? "#f59e0b"
                    : idx === 2
                      ? "#60a5fa"
                      : "#a78bfa";

              return (
                <div key={item.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#f5f5f7] font-medium truncate max-w-[200px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-[#8b8b9e]">
                        {mode === "perQuery"
                          ? `$${costValue.toFixed(4)}`
                          : `$${costValue.toFixed(4)}`}
                      </span>
                      <span className="text-[#55556a]">|</span>
                      <span
                        className="font-[family-name:var(--font-geist-mono)] tabular-nums"
                        style={{ color: barColor }}
                      >
                        {item.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-5 rounded-md overflow-hidden bg-[rgba(255,255,255,0.04)]">
                    {/* Cost bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${costPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="absolute top-0 left-0 h-full rounded-md"
                      style={{
                        background: `linear-gradient(90deg, ${barColor}40, ${barColor}20)`,
                      }}
                    />
                    {/* Score indicator */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${scorePct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                      className="absolute top-0 left-0 h-1.5 rounded-t-md"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-[#55556a]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-sm bg-[#10b981]" />
              <span>Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[rgba(16,185,129,0.15)]" />
              <span>
                {mode === "perQuery"
                  ? "Cost per Query"
                  : "Cost per Correct Answer"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
