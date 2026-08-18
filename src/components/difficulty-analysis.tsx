"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Mountain, SunMedium, Flame, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import type { BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface DifficultyAnalysisProps {
  benchmarksData: BenchmarksResponse | null;
  isLoading?: boolean;
}

interface DifficultyGroup {
  level: string;
  count: number;
  avgScore: number;
  benchmarks: { name: string; avgScore: number }[];
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

export function DifficultyAnalysis({ benchmarksData, isLoading }: DifficultyAnalysisProps) {
  const { groups, hardest, easiest } = useMemo(() => {
    const categories = benchmarksData?.categories ?? [];
    const allBenchmarks: { name: string; difficulty: string; avgScore: number }[] = [];

    for (const cat of categories) {
      for (const bm of cat.benchmarks ?? []) {
        const rankings = bm.modelRankings ?? [];
        const avgScore =
          rankings.length > 0
            ? rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length
            : 0;
        allBenchmarks.push({
          name: bm.name,
          difficulty: bm.difficulty,
          avgScore,
        });
      }
    }

    if (allBenchmarks.length === 0) {
      return { groups: [], hardest: null, easiest: null };
    }

    // Group by difficulty
    const difficultyMap = new Map<string, { name: string; avgScore: number }[]>();
    for (const bm of allBenchmarks) {
      const key = normalizeDifficulty(bm.difficulty);
      if (!difficultyMap.has(key)) difficultyMap.set(key, []);
      difficultyMap.get(key)!.push({ name: bm.name, avgScore: bm.avgScore });
    }

    const order = ["easy", "medium", "hard"];
    const colorMap: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
      easy: { color: "#10b981", bgColor: "#10b98115", icon: SunMedium },
      medium: { color: "#f59e0b", bgColor: "#f59e0b15", icon: Mountain },
      hard: { color: "#ef4444", bgColor: "#ef444415", icon: Flame },
    };

    const groups: DifficultyGroup[] = order
      .filter((level) => difficultyMap.has(level))
      .map((level) => {
        const items = difficultyMap.get(level) ?? [];
        const avgScore =
          items.length > 0
            ? items.reduce((sum, b) => sum + b.avgScore, 0) / items.length
            : 0;
        const cfg = colorMap[level];
        return {
          level: level.charAt(0).toUpperCase() + level.slice(1),
          count: items.length,
          avgScore,
          benchmarks: items.sort((a, b) => a.avgScore - b.avgScore),
          color: cfg.color,
          bgColor: cfg.bgColor,
          icon: cfg.icon,
        };
      });

    // Hardest benchmark
    const hardest = allBenchmarks.reduce(
      (worst, bm) => (bm.avgScore < worst.avgScore ? bm : worst),
      allBenchmarks[0]
    );

    // Easiest benchmark
    const easiest = allBenchmarks.reduce(
      (best, bm) => (bm.avgScore > best.avgScore ? bm : best),
      allBenchmarks[0]
    );

    return { groups, hardest, easiest };
  }, [benchmarksData]);

  if (isLoading || groups.length === 0) {
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
            <Mountain className="h-3 w-3" />
            Difficulty
          </span>
        </motion.div>
        <div className="relative mb-2 text-center">
          <SectionNumber number="11" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Benchmark Difficulty Analysis
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          How models perform across easy, medium, and hard benchmarks
        </motion.p>

        {/* Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {groups.map((group, idx) => {
            const IconComp = group.icon;
            return (
              <motion.div
                key={group.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card glass-card-gradient-border glass-card-hover p-5 relative overflow-hidden"
              >
                <div
                  className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-3xl pointer-events-none"
                  style={{ backgroundColor: group.bgColor }}
                />
                <div className="relative z-10">
                  {/* Icon + Level */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: group.bgColor, color: group.color }}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-[#f5f5f7]">
                      {group.level}
                    </span>
                    <span
                      className="ml-auto inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ backgroundColor: group.bgColor, color: group.color }}
                    >
                      {group.count} benchmarks
                    </span>
                  </div>

                  {/* Avg Score */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span
                      className="text-3xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums"
                      style={{ color: group.color }}
                    >
                      {group.avgScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#8b8b9e]">avg score</span>
                  </div>

                  {/* Score distribution bars */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {group.benchmarks.map((bm) => (
                      <div key={bm.name}>
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-[#8b8b9e] truncate max-w-[160px]">
                            {bm.name}
                          </span>
                          <span
                            className="font-[family-name:var(--font-geist-mono)] tabular-nums shrink-0"
                            style={{ color: group.color }}
                          >
                            {bm.avgScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${bm.avgScore}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Callouts: Hardest & Easiest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hardest && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="glass-card p-4 rounded-xl flex items-start gap-3 border border-[#ef444420]"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef444415] text-[#ef4444] shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#ef4444] uppercase tracking-wider mb-0.5">
                  Hardest Benchmark
                </div>
                <div className="text-sm font-bold text-[#f5f5f7]">
                  {hardest.name}
                </div>
                <div className="text-xs text-[#8b8b9e] mt-0.5">
                  Average score:{" "}
                  <span className="text-[#ef4444] font-[family-name:var(--font-geist-mono)] tabular-nums">
                    {hardest.avgScore.toFixed(1)}
                  </span>{" "}
                  across all models
                </div>
              </div>
            </motion.div>
          )}

          {easiest && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="glass-card p-4 rounded-xl flex items-start gap-3 border border-[#10b98120]"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#10b98115] text-[#10b981] shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#10b981] uppercase tracking-wider mb-0.5">
                  Easiest Benchmark
                </div>
                <div className="text-sm font-bold text-[#f5f5f7]">
                  {easiest.name}
                </div>
                <div className="text-xs text-[#8b8b9e] mt-0.5">
                  Average score:{" "}
                  <span className="text-[#10b981] font-[family-name:var(--font-geist-mono)] tabular-nums">
                    {easiest.avgScore.toFixed(1)}
                  </span>{" "}
                  across all models
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function normalizeDifficulty(d: string): string {
  const lower = d.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner") || lower.includes("basic")) return "easy";
  if (lower.includes("hard") || lower.includes("difficult") || lower.includes("advanced") || lower.includes("expert")) return "hard";
  return "medium";
}
