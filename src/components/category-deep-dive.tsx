"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Target, AlertTriangle, TrendingUp } from "lucide-react";
import type { BenchmarksResponse, ModelsResponse, Category } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";
import { ScoreGauge } from "@/components/shared-ui";

interface CategoryDeepDiveProps {
  benchmarksData: BenchmarksResponse | null;
  modelsData: ModelsResponse | null;
  isLoading: boolean;
  defaultCategorySlug?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  legal: "#f59e0b",
  healthcare: "#10b981",
  fintech: "#60a5fa",
  vernacular: "#a78bfa",
  education: "#f97316",
};

function ScoreBar({
  score,
  color,
  rank,
  name,
  provider,
  delay = 0,
}: {
  score: number;
  color: string;
  rank: number;
  name: string;
  provider: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 group"
    >
      <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums w-5 text-[#55556a]">
        #{rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-[#f5f5f7] truncate">{name}</span>
          <span
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium"
            style={{
              backgroundColor: `${CATEGORY_COLORS[provider.toLowerCase()] || "#55556a"}15`,
              color: CATEGORY_COLORS[provider.toLowerCase()] || "#8b8b9e",
            }}
          >
            {provider}
          </span>
        </div>
        <div className="h-4 rounded bg-[rgba(255,255,255,0.04)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.6, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded"
            style={{
              background: `linear-gradient(90deg, ${color}50, ${color}20)`,
              border: `1px solid ${color}30`,
            }}
          />
        </div>
      </div>
      <span
        className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums font-bold w-10 text-right"
        style={{ color }}
      >
        {score.toFixed(1)}
      </span>
    </motion.div>
  );
}

export function CategoryDeepDive({
  benchmarksData,
  modelsData,
  isLoading,
  defaultCategorySlug,
}: CategoryDeepDiveProps) {
  const categories = benchmarksData?.categories ?? [];
  const [selectedSlug, setSelectedSlug] = useState<string>(
    defaultCategorySlug ?? categories[0]?.slug ?? ""
  );

  // Update selected slug when categories load
  const effectiveSlug = selectedSlug || categories[0]?.slug || "";
  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === effectiveSlug) ?? categories[0] ?? null,
    [categories, effectiveSlug]
  );

  // Category stats
  const categoryStats = useMemo(() => {
    if (!selectedCategory || !modelsData) return null;
    const benchmarks = selectedCategory.benchmarks ?? [];
    const models = modelsData.models;

    // Average score across all benchmarks for this category
    const allScores: number[] = [];
    let hardestBenchmark = benchmarks[0]?.name ?? "N/A";
    let hardestScore = 100;

    benchmarks.forEach((bm) => {
      const rankings = bm.modelRankings ?? [];
      rankings.forEach((r) => allScores.push(r.score));

      // Find hardest (lowest avg score)
      if (rankings.length > 0) {
        const avg = rankings.reduce((s, r) => s + r.score, 0) / rankings.length;
        if (avg < hardestScore) {
          hardestScore = avg;
          hardestBenchmark = bm.name;
        }
      }
    });

    const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    const topScore = allScores.length > 0 ? Math.max(...allScores) : 0;

    return {
      avgScore: Math.round(avgScore * 10) / 10,
      topScore: Math.round(topScore * 10) / 10,
      numBenchmarks: benchmarks.length,
      hardestBenchmark,
      hardestAvgScore: Math.round(hardestScore * 10) / 10,
    };
  }, [selectedCategory, modelsData]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="h-80 rounded-xl bg-[rgba(255,255,255,0.03)]" />
        </div>
      </section>
    );
  }

  if (!selectedCategory) return null;

  const catColor = CATEGORY_COLORS[selectedCategory.slug] ?? selectedCategory.color ?? "#8b8b9e";

  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="08" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Category Deep Dive
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-[#8b8b9e]"
        >
          Drill into each domain — benchmark-level scores and model rankings
        </motion.p>

        {/* Category Selector */}
        <div className="max-w-xs mx-auto mb-8">
          <Select value={effectiveSlug} onValueChange={setSelectedSlug}>
            <SelectTrigger className="w-full dark-select-trigger !rounded-xl !h-11">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent className="dark-select-content">
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Stats Summary */}
        {categoryStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto"
          >
            {[
              { icon: BarChart3, label: "Benchmarks", value: categoryStats.numBenchmarks, color: catColor },
              { icon: TrendingUp, label: "Avg Score", value: categoryStats.avgScore, color: "#10b981" },
              { icon: Target, label: "Top Score", value: categoryStats.topScore, color: "#f59e0b" },
              { icon: AlertTriangle, label: "Hardest", value: categoryStats.hardestAvgScore, color: "#ef4444" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card p-4 text-center"
                >
                  <Icon className="h-4 w-4 mx-auto mb-2" style={{ color: stat.color }} />
                  <div
                    className="text-lg font-bold font-[family-name:var(--font-geist-mono)] tabular-nums"
                    style={{ color: stat.color }}
                  >
                    {typeof stat.value === "number" ? stat.value.toFixed(stat.value % 1 === 0 ? 0 : 1) : stat.value}
                  </div>
                  <div className="text-[10px] text-[#55556a] uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Hardest Benchmark Note */}
        {categoryStats && categoryStats.hardestBenchmark !== "N/A" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium glass-card"
              style={{ borderColor: `${catColor}30`, color: catColor }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Hardest: {categoryStats.hardestBenchmark} (avg {categoryStats.hardestAvgScore})
            </span>
          </motion.div>
        )}

        {/* Benchmarks Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card p-5 md:p-6">
            <h3 className="text-sm font-medium text-[#8b8b9e] uppercase tracking-wider mb-4">
              Benchmarks in {selectedCategory.name}
            </h3>

            <Accordion type="multiple" className="w-full space-y-2">
              {(selectedCategory.benchmarks ?? []).map((bm, bmIdx) => {
                const rankings = (bm.modelRankings ?? [])
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5);

                // Benchmark average
                const allRanks = bm.modelRankings ?? [];
                const bmAvg =
                  allRanks.length > 0
                    ? Math.round((allRanks.reduce((s, r) => s + r.score, 0) / allRanks.length) * 10) / 10
                    : 0;

                return (
                  <AccordionItem
                    key={bm.id}
                    value={bm.slug}
                    className="border border-[rgba(255,255,255,0.06)] rounded-xl px-4 !border-b data-[state=open]:border-[rgba(255,255,255,0.12)]"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 flex-1">
                        <ScoreGauge score={bmAvg} size={32} strokeWidth={2.5} />
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#f5f5f7] truncate">
                            {bm.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#55556a]">
                              {bm.numQuestions} questions
                            </span>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${catColor}12`,
                                color: catColor,
                              }}
                            >
                              {bm.difficulty}
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums font-bold"
                          style={{ color: catColor }}
                        >
                          {bmAvg}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2 pb-1">
                        {rankings.length === 0 && (
                          <p className="text-xs text-[#55556a] text-center py-4">
                            No evaluation data yet
                          </p>
                        )}
                        {rankings.map((r, rIdx) => (
                          <ScoreBar
                            key={r.modelId}
                            score={r.score}
                            color={catColor}
                            rank={rIdx + 1}
                            name={r.modelName}
                            provider={r.provider}
                            delay={bmIdx * 0.05 + rIdx * 0.06}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
