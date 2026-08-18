"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Gem, Flame, Zap, Hash, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import type { StatsResponse, ModelsResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";
import { AnimatedCounter } from "@/components/shared-ui";

interface InsightsSectionProps {
  statsData: StatsResponse | null;
  modelsData: ModelsResponse | null;
}



interface InsightCardData {
  icon: React.ElementType;
  label: string;
  value: string | number;
  isAnimatedNumber?: boolean;
  suffix?: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  iconColor: string;
  details?: { label: string; value: string }[];
}

export function InsightsSection({ statsData, modelsData }: InsightsSectionProps) {
  const insights: InsightCardData[] = useMemo(() => {
    const models = modelsData?.models ?? [];
    const categories = modelsData?.categories ?? [];

    // 1. Top Model — highest overallScore
    const topModel = models.length > 0
      ? models.reduce((best, m) => (m.overallScore > best.overallScore ? m : best), models[0])
      : null;

    // 2. Best Value — cost-efficiency: highest overallScore / avgCostUsd
    const modelsWithCost = models.filter((m) => (m.avgCostUsd ?? 0) > 0);
    const bestValue = modelsWithCost.length > 0
      ? modelsWithCost.reduce((best, m) => {
          const bestRatio = best.overallScore / (best.avgCostUsd ?? Infinity);
          const mRatio = m.overallScore / (m.avgCostUsd ?? Infinity);
          return mRatio > bestRatio ? m : best;
        }, modelsWithCost[0])
      : null;

    // 3. Hardest Domain — category with lowest avg score
    let hardestDomain = { name: "Vernacular", avgScore: 0 };
    if (categories.length > 0 && models.length > 0) {
      const catAvgs = categories.map((cat) => {
        const scores = models
          .map((m) => m.categoryScores?.[cat.slug])
          .filter((s): s is number => s != null);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return { name: cat.name, avgScore: avg };
      });
      hardestDomain = catAvgs.reduce((worst, c) => (c.avgScore < worst.avgScore ? c : worst), catAvgs[0]);
    }

    // 4. Fastest Model — model with lowest avg latency (real data from API)
    const fastestModel = models.length > 0
      ? [...models]
        .filter((m) => (m.avgLatencyMs ?? 0) > 0)
        .sort((a, b) => (a.avgLatencyMs ?? Infinity) - (b.avgLatencyMs ?? Infinity))[0]
      : null;

    // 5. Total Questions
    const totalQuestions = statsData?.totals.questions ?? 3535;

    // Build detail rows for expandable cards
    const topModelDetails = topModel ? categories.map((cat) => {
      const score = topModel.categoryScores?.[cat.slug];
      return { label: cat.name, value: score != null ? score.toFixed(1) : "—" };
    }) : [];

    const bestValueDetails = bestValue ? categories.map((cat) => {
      const score = bestValue.categoryScores?.[cat.slug];
      return { label: cat.name, value: score != null ? score.toFixed(1) : "—" };
    }) : [];

    const hardestDomainDetails = categories.length > 0 && models.length > 0
      ? categories.map((cat) => {
          const scores = models.map((m) => m.categoryScores?.[cat.slug]).filter((s): s is number => s != null);
          const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
          return { label: cat.name, value: avg.toFixed(1) };
        })
      : [];

    const fastestDetails = fastestModel ? categories.map((cat) => {
      const score = fastestModel.categoryScores?.[cat.slug];
      return { label: cat.name, value: score != null ? score.toFixed(1) : "—" };
    }) : [];

    const totalQuestionsDetails = statsData?.categories
      ? statsData.categories.map((cat) => ({ label: cat.name, value: `${cat.numBenchmarks ?? 0} benchmarks` }))
      : [];

    return [
      {
        icon: Trophy,
        label: "Top Model",
        value: topModel ? topModel.overallScore.toFixed(1) : "—",
        isAnimatedNumber: false,
        trend: "up" as const,
        trendLabel: topModel ? topModel.name : "N/A",
        iconColor: "#fbbf24",
        details: topModelDetails,
      },
      {
        icon: Gem,
        label: "Best Value",
        value: bestValue
          ? `${(bestValue.overallScore / (bestValue.avgCostUsd ?? 1)).toFixed(1)}`
          : "N/A",
        isAnimatedNumber: false,
        suffix: bestValue ? "/$" : "",
        trend: "up" as const,
        trendLabel: bestValue ? bestValue.name : "No cost data",
        iconColor: "#10b981",
        details: bestValueDetails,
      },
      {
        icon: Flame,
        label: "Hardest Domain",
        value: hardestDomain.avgScore > 0 ? hardestDomain.avgScore.toFixed(1) : "—",
        isAnimatedNumber: false,
        trend: "down" as const,
        trendLabel: hardestDomain.name,
        iconColor: "#f97316",
        details: hardestDomainDetails,
      },
      {
        icon: Zap,
        label: "Fastest Model",
        value: fastestModel?.avgLatencyMs ?? "—",
        isAnimatedNumber: false,
        suffix: fastestModel?.avgLatencyMs ? "ms avg" : "",
        trend: "up" as const,
        trendLabel: fastestModel ? fastestModel.name : "N/A",
        iconColor: "#60a5fa",
        details: fastestDetails,
      },
      {
        icon: Hash,
        label: "Total Questions",
        value: totalQuestions,
        isAnimatedNumber: true,
        suffix: "+",
        trend: "up" as const,
        trendLabel: `${categories.length} categories`,
        iconColor: "#a78bfa",
        details: totalQuestionsDetails,
      },
    ];
  }, [statsData, modelsData]);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <section className="relative py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-2 text-center"
        >
          <span className="section-label">
            <Trophy className="h-3 w-3" />
            Metrics
          </span>
        </motion.div>
        <div className="relative mb-2 text-center">
          <SectionNumber number="02" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Key Insights
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Highlights from the latest evaluation cycle
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {insights.map((insight, i) => {
            const IconComp = insight.icon;
            const isExpanded = expandedCard === insight.label;
            return (
              <motion.div
                key={insight.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card glass-card-gradient-border glass-card-hover p-4 md:p-5 flex flex-col items-center text-center cursor-pointer select-none"
                onClick={() => setExpandedCard(isExpanded ? null : insight.label)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${insight.label}: ${insight.value}. Click to ${isExpanded ? "collapse" : "expand"} details`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedCard(isExpanded ? null : insight.label);
                  }
                }}
              >
                {/* Icon */}
                <div
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${insight.iconColor}15`,
                    color: insight.iconColor,
                  }}
                >
                  <IconComp className="h-5 w-5" />
                </div>

                {/* Value */}
                <div className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7] mb-1">
                  {insight.isAnimatedNumber ? (
                    <AnimatedCounter
                      target={typeof insight.value === "number" ? insight.value : 0}
                      suffix={insight.suffix}
                    />
                  ) : (
                    <>
                      {insight.value}
                      {insight.suffix && (
                        <span className="text-sm font-normal text-[#8b8b9e] ml-1">{insight.suffix}</span>
                      )}
                    </>
                  )}
                </div>

                {/* Label */}
                <div className="text-xs text-[#8b8b9e] uppercase tracking-wider mb-2">
                  {insight.label}
                </div>

                {/* Trend */}
                <div className="flex items-center gap-1 text-[10px]">
                  {insight.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-[#10b981]" />
                  ) : insight.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 text-[#f97316]" />
                  ) : null}
                  <span className={insight.trend === "up" ? "text-[#10b981]" : insight.trend === "down" ? "text-[#f97316]" : "text-[#55556a]"}>
                    {insight.trendLabel}
                  </span>
                </div>

                {/* Chevron expand indicator */}
                {insight.details && insight.details.length > 0 && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-[#55556a]" />
                  </motion.div>
                )}

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && insight.details && insight.details.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-1.5">
                        {insight.details.map((detail) => (
                          <div
                            key={detail.label}
                            className="flex items-center justify-between text-[11px]"
                          >
                            <span className="text-[#8b8b9e]">{detail.label}</span>
                            <span className="font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
