"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart3, Trophy, TrendingUp, Target, Percent } from "lucide-react";
import type { StatsResponse, ModelsResponse, BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface PerformanceSummaryCardsProps {
  statsData: StatsResponse | null;
  modelsData: ModelsResponse | null;
  benchmarksData: BenchmarksResponse | null;
  isLoading?: boolean;
}

interface SummaryCard {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  sublabel: string;
  color: string;
  glowColor: string;
}

/* Animated number that counts up */
function AnimatedValue({ target, suffix = "", duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target === 0) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return (
    <span className="font-[family-name:var(--font-geist-mono)] tabular-nums">
      {target >= 10 ? count.toFixed(1) : count.toFixed(1)}
      {suffix}
    </span>
  );
}

export function PerformanceSummaryCards({
  statsData,
  modelsData,
  benchmarksData,
  isLoading,
}: PerformanceSummaryCardsProps) {
  const cards: SummaryCard[] = useMemo(() => {
    const models = modelsData?.models ?? [];
    const categories = benchmarksData?.categories ?? [];

    if (models.length === 0) return [];

    // 1. Average Score across all models
    const avgScore =
      models.length > 0
        ? models.reduce((sum, m) => sum + m.overallScore, 0) / models.length
        : 0;

    // 2. Top Performer — model with highest overall score
    const topPerformer = models.reduce(
      (best, m) => (m.overallScore > best.overallScore ? m : best),
      models[0]
    );

    // 3. Most Improved — model with biggest gap above average
    const mostImproved = models.reduce(
      (best, m) => {
        const gapM = m.overallScore - avgScore;
        const gapBest = best.overallScore - avgScore;
        return gapM > gapBest ? m : best;
      },
      models[0]
    );
    const improvementGap = mostImproved.overallScore - avgScore;

    // 4. Coverage — % of benchmarks where at least one model scores > 80
    let totalBenchmarks = 0;
    let coveredBenchmarks = 0;
    for (const cat of categories) {
      for (const bm of cat.benchmarks ?? []) {
        totalBenchmarks++;
        const rankings = bm.modelRankings ?? [];
        if (rankings.some((r) => r.score > 80)) {
          coveredBenchmarks++;
        }
      }
    }
    const coverage =
      totalBenchmarks > 0 ? (coveredBenchmarks / totalBenchmarks) * 100 : 0;

    return [
      {
        icon: BarChart3,
        label: "Average Score",
        value: avgScore,
        suffix: "",
        sublabel: `Across ${models.length} models`,
        color: "#f59e0b",
        glowColor: "#f59e0b15",
      },
      {
        icon: Trophy,
        label: "Top Performer",
        value: topPerformer.overallScore,
        suffix: "",
        sublabel: topPerformer.name,
        color: "#10b981",
        glowColor: "#10b98115",
      },
      {
        icon: TrendingUp,
        label: "Most Improved",
        value: improvementGap,
        suffix: "+",
        sublabel: mostImproved.name,
        color: "#60a5fa",
        glowColor: "#60a5fa15",
      },
      {
        icon: Target,
        label: "Coverage",
        value: coverage,
        suffix: "%",
        sublabel: `${coveredBenchmarks}/${totalBenchmarks} benchmarks > 80`,
        color: "#a78bfa",
        glowColor: "#a78bfa15",
      },
    ];
  }, [modelsData, benchmarksData]);

  if (isLoading || cards.length === 0) {
    return (
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card p-5 h-32 rounded-xl bg-[rgba(255,255,255,0.03)]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8">
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
            <Percent className="h-3 w-3" />
            Summary
          </span>
        </motion.div>
        <div className="relative mb-2 text-center">
          <SectionNumber number="12" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Performance Summary
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-[#8b8b9e]"
        >
          Key performance metrics at a glance
        </motion.p>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card glass-card-shine p-5 relative overflow-hidden group"
              >
                {/* Glow */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: card.glowColor }}
                />
                {/* Inner glow at bottom */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8 rounded-full blur-xl pointer-events-none opacity-40"
                  style={{ backgroundColor: card.color }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3"
                    style={{ backgroundColor: card.glowColor, color: card.color }}
                  >
                    <IconComp className="h-4.5 w-4.5" />
                  </div>

                  {/* Value */}
                  <div className="text-3xl md:text-4xl font-bold text-[#f5f5f7] mb-1">
                    <AnimatedValue target={card.value} suffix={card.suffix} />
                  </div>

                  {/* Label */}
                  <div className="text-xs text-[#8b8b9e] uppercase tracking-wider mb-1">
                    {card.label}
                  </div>

                  {/* Sublabel / Trend */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <TrendingUp className="h-3 w-3" style={{ color: card.color }} />
                    <span className="text-[#55556a] truncate max-w-[140px]">
                      {card.sublabel}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
