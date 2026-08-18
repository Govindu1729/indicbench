"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Trophy,
  TrendingUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface BenchmarkTimelineProps {
  data: BenchmarksResponse | null;
  isLoading: boolean;
}

/* ===== Mock timeline dates based on benchmark data ===== */
function generateTimelineEntries(data: BenchmarksResponse | null) {
  if (!data) return [];

  const entries: {
    id: string;
    benchmarkName: string;
    benchmarkSlug: string;
    categoryName: string;
    categorySlug: string;
    categoryColor: string;
    date: Date;
    topModel: string;
    avgScore: number;
  }[] = [];

  const baseDate = new Date(2025, 0, 15); // Jan 15, 2025

  for (const cat of data.categories) {
    for (let i = 0; i < cat.benchmarks.length; i++) {
      const bm = cat.benchmarks[i];
      const topModel = bm.modelRankings?.[0];
      const avgScore =
        bm.modelRankings && bm.modelRankings.length > 0
          ? bm.modelRankings.reduce((s, r) => s + r.score, 0) /
            bm.modelRankings.length
          : 0;

      // Stagger dates so they appear across the timeline
      const dayOffset = i * 3 + cat.order * 7;
      const entryDate = new Date(baseDate);
      entryDate.setDate(entryDate.getDate() + dayOffset);

      entries.push({
        id: bm.id,
        benchmarkName: bm.name,
        benchmarkSlug: bm.slug,
        categoryName: cat.name,
        categorySlug: cat.slug,
        categoryColor: cat.color,
        date: entryDate,
        topModel: topModel?.modelName ?? "N/A",
        avgScore: Math.round(avgScore * 10) / 10,
      });
    }
  }

  // Sort by date descending
  entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  return entries;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

const ITEMS_PER_PAGE = 5;

export function BenchmarkTimeline({
  data,
  isLoading,
}: BenchmarkTimelineProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCount, setShowCount] = useState(ITEMS_PER_PAGE);

  const allEntries = useMemo(() => generateTimelineEntries(data), [data]);

  const categories = useMemo(() => {
    const cats = data?.categories ?? [];
    return cats;
  }, [data]);

  const filteredEntries = useMemo(() => {
    if (categoryFilter === "all") return allEntries;
    return allEntries.filter((e) => e.categorySlug === categoryFilter);
  }, [allEntries, categoryFilter]);

  const visibleEntries = filteredEntries.slice(0, showCount);
  const hasMore = showCount < filteredEntries.length;

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <div className="space-y-6 max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <Skeleton className="h-24 flex-1 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="10" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Benchmark Timeline
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-center text-[#8b8b9e]"
        >
          Track when benchmarks were added and evaluated over time
        </motion.p>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <Filter className="h-3.5 w-3.5 text-[#55556a]" />
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setShowCount(ITEMS_PER_PAGE); }}>
            <SelectTrigger className="h-8 text-xs bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#f5f5f7] w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark-dialog-content">
              <SelectItem value="all" className="text-xs">
                All Categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug} className="text-xs">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Timeline */}
        {visibleEntries.length === 0 ? (
          <div className="glass-card p-8 text-center max-w-md mx-auto">
            <Clock className="h-8 w-8 mx-auto mb-3 text-[#55556a]" />
            <p className="text-sm text-[#8b8b9e]">
              No benchmarks found for this filter
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto relative">
            {/* Center line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)] md:-translate-x-px" />

            <AnimatePresence mode="popLayout">
              {visibleEntries.map((entry, i) => {
                const isLeft = i % 2 === 0;
                const scoreColor =
                  entry.avgScore >= 80
                    ? "#10b981"
                    : entry.avgScore >= 60
                      ? "#f59e0b"
                      : "#f97316";

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                    className="relative mb-6 last:mb-0"
                  >
                    {/* Date node */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[rgba(255,255,255,0.08)] bg-[#0a0a0f]"
                        style={{ borderColor: `${entry.categoryColor}40` }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.categoryColor }}
                        />
                      </div>
                    </div>

                    {/* Card - mobile always right, desktop alternating */}
                    <div
                      className={`ml-14 md:ml-0 md:w-[calc(50%-24px)] ${
                        isLeft ? "md:mr-auto md:pr-0" : "md:ml-auto md:pl-0"
                      }`}
                    >
                      <div className="glass-card p-4 !rounded-xl relative overflow-hidden group">
                        {/* Category color accent */}
                        <div
                          className="absolute top-0 left-0 w-full h-0.5"
                          style={{ backgroundColor: entry.categoryColor }}
                        />

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="text-sm font-medium text-[#f5f5f7] group-hover:text-[#f59e0b] transition-colors">
                              {entry.benchmarkName}
                            </h4>
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-medium mt-0.5"
                              style={{ color: entry.categoryColor }}
                            >
                              {entry.categoryName}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-[#55556a] flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDate(entry.date)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px]">
                          <div className="flex items-center gap-1.5 text-[#8b8b9e]">
                            <Trophy className="h-3 w-3 text-[#fbbf24]" />
                            <span className="truncate max-w-[100px]">
                              {entry.topModel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" style={{ color: scoreColor }} />
                            <span
                              className="font-[family-name:var(--font-geist-mono)] tabular-nums font-medium"
                              style={{ color: scoreColor }}
                            >
                              {entry.avgScore.toFixed(1)}
                            </span>
                            <span className="text-[#55556a]">avg</span>
                          </div>
                        </div>

                        {/* Desktop date on the opposite side */}
                        <div className="hidden md:block absolute top-4 text-[10px] text-[#55556a] font-[family-name:var(--font-geist-mono)]">
                          {isLeft ? (
                            <span className="right-full mr-4 absolute">
                              {formatMonth(entry.date)}
                            </span>
                          ) : (
                            <span className="left-full ml-4 absolute">
                              {formatMonth(entry.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Show More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-8"
              >
                <button
                  onClick={() => setShowCount((c) => c + ITEMS_PER_PAGE)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card glass-card-hover text-xs font-medium text-[#f5f5f7] hover:!border-[rgba(245,158,11,0.4)] hover:!text-[#f59e0b] transition-all"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show More ({filteredEntries.length - showCount} remaining)
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
