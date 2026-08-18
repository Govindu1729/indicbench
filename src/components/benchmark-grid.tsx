"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Scale,
  HeartPulse,
  Landmark,
  Languages,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import type { BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface BenchmarkGridProps {
  data: BenchmarksResponse | null;
  isLoading: boolean;
  onBenchmarkClick: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  legal: Scale,
  healthcare: HeartPulse,
  fintech: Landmark,
  vernacular: Languages,
  education: GraduationCap,
};

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  easy: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", label: "Easy" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", label: "Medium" },
  hard: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", label: "Hard" },
  mixed: { color: "#8b8b9e", bg: "rgba(139,139,158,0.1)", border: "rgba(139,139,158,0.2)", label: "Mixed" },
};

const DIFFICULTY_FILTERS = ["all", "easy", "medium", "hard"] as const;
type DifficultyFilter = typeof DIFFICULTY_FILTERS[number];

function MiniGauge({ score, size = 24 }: { score: number; size?: number }) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f97316";
  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export function BenchmarkGrid({ data, isLoading, onBenchmarkClick }: BenchmarkGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  const categories = data?.categories ?? [];

  // Count total benchmarks
  const totalBenchmarks = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.benchmarks.length, 0),
    [categories]
  );

  // Count benchmarks per difficulty
  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    for (const cat of categories) {
      for (const bm of cat.benchmarks) {
        const d = bm.difficulty.toLowerCase();
        if (d in counts) counts[d]++;
      }
    }
    return counts;
  }, [categories]);

  // Filter categories and benchmarks based on search + category filter + difficulty filter
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return categories
      .map((cat) => {
        // If a category filter is active and it doesn't match, skip
        if (activeFilter && cat.slug !== activeFilter) return null;
        // Filter benchmarks by search query + difficulty
        const filteredBenchmarks = cat.benchmarks.filter((bm) => {
          const matchesQuery = query ? bm.name.toLowerCase().includes(query) : true;
          const matchesDifficulty = difficultyFilter === "all" || bm.difficulty.toLowerCase() === difficultyFilter;
          return matchesQuery && matchesDifficulty;
        });
        if (filteredBenchmarks.length === 0) return null;
        return { ...cat, benchmarks: filteredBenchmarks };
      })
      .filter(Boolean) as typeof categories;
  }, [categories, searchQuery, activeFilter, difficultyFilter]);

  const filteredCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.benchmarks.length, 0),
    [filteredCategories]
  );

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-28 w-full rounded-xl bg-[rgba(255,255,255,0.03)]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="benchmarks" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="relative mb-2 text-center">
          <SectionNumber number="06" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Benchmark Details
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-[#8b8b9e]"
        >
          Explore each benchmark — click to see model rankings &amp; charts
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6 max-w-lg mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556a]" />
            <input
              type="text"
              placeholder="Search benchmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-card !rounded-xl pl-11 pr-10 py-3 text-sm text-[#f5f5f7] placeholder:text-[#55556a] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:outline-none focus:border-[rgba(245,158,11,0.3)] focus:bg-[rgba(255,255,255,0.05)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-[#8b8b9e] hover:text-[#f5f5f7] transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          <button
            className={`glass-pill ${!activeFilter ? "glass-pill-active" : ""}`}
            onClick={() => setActiveFilter(null)}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`glass-pill ${activeFilter === cat.slug ? "glass-pill-active" : ""}`}
              onClick={() => setActiveFilter(activeFilter === cat.slug ? null : cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Difficulty filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {DIFFICULTY_FILTERS.map((diff) => {
            const isAll = diff === "all";
            const config = isAll ? null : DIFFICULTY_CONFIG[diff];
            const isActive = difficultyFilter === diff;
            const count = isAll ? totalBenchmarks : (difficultyCounts[diff] ?? 0);

            return (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={
                  isActive && !isAll && config
                    ? {
                        backgroundColor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`,
                      }
                    : isActive && isAll
                      ? {
                          backgroundColor: "rgba(245,158,11,0.1)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.3)",
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.03)",
                          color: "#8b8b9e",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                }
              >
                {!isAll && config && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                )}
                {isAll ? "All" : config?.label ?? diff}
                <span
                  className="font-[family-name:var(--font-geist-mono)] text-[10px] opacity-70"
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Result count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="mb-6 text-center text-xs text-[#55556a]"
        >
          Showing <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">{filteredCount}</span> of{" "}
          <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">{totalBenchmarks}</span> benchmarks
        </motion.div>

        {/* No results state */}
        {filteredCategories.length === 0 && (
          <div className="glass-card p-8 text-center max-w-md mx-auto">
            <Search className="h-8 w-8 mx-auto mb-3 text-[#55556a]" />
            <p className="text-sm text-[#8b8b9e]">No benchmarks match your search</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveFilter(null); setDifficultyFilter("all"); }}
              className="mt-3 text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {filteredCategories.map((cat, catIdx) => {
          const Icon = CATEGORY_ICONS[cat.slug] || Scale;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: catIdx * 0.1 }}
              className="mb-10"
            >
              {/* Category header */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-playfair)] text-[#f5f5f7]">{cat.name}</h3>
                <span className="text-xs text-[#55556a]">
                  ({cat.benchmarks.length} benchmarks)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.benchmarks.map((bm, bmIdx) => {
                  const diff = DIFFICULTY_CONFIG[bm.difficulty] || DIFFICULTY_CONFIG.mixed;
                  const topModel = bm.modelRankings?.[0];

                  return (
                    <motion.div
                      key={bm.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: bmIdx * 0.04 }}
                    >
                      <div
                        className="group cursor-pointer glass-card glass-card-hover p-4 relative overflow-hidden"
                        style={{ borderLeftWidth: "3px", borderLeftColor: `${cat.color}50` }}
                        onClick={() => onBenchmarkClick(bm.slug)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm text-[#f5f5f7] group-hover:text-[#f59e0b] transition-colors">
                            {bm.name}
                          </h4>
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                            style={{ backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diff.color }} />
                            {bm.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-[#55556a] line-clamp-2 mb-3 leading-relaxed">
                          {bm.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">{bm.numQuestions} Qs</span>
                          {topModel && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[10px] text-[#8b8b9e] truncate max-w-[80px]">{topModel.modelName}</span>
                              <MiniGauge score={topModel.score} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
