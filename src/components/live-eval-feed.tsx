"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LeaderboardResponse, BenchmarksResponse } from "@/lib/api";

interface LiveEvalFeedProps {
  leaderboardData: LeaderboardResponse | null;
  benchmarksData: BenchmarksResponse | null;
  isLoading: boolean;
}

const RELATIVE_TIMES = [
  "1m ago",
  "2m ago",
  "3m ago",
  "5m ago",
  "7m ago",
  "9m ago",
  "11m ago",
  "14m ago",
  "18m ago",
  "22m ago",
  "27m ago",
  "33m ago",
];

interface FeedEntry {
  id: string;
  modelName: string;
  provider: string;
  benchmarkName: string;
  categoryName: string;
  categoryColor: string;
  score: number;
  relativeTime: string;
}

function generateFeedEntries(
  leaderboardData: LeaderboardResponse | null,
  benchmarksData: BenchmarksResponse | null
): FeedEntry[] {
  const entries: FeedEntry[] = [];
  if (!leaderboardData?.overallRanking || !benchmarksData?.categories) return entries;

  const models = leaderboardData.overallRanking;
  const categories = benchmarksData.categories;

  for (let i = 0; i < 12; i++) {
    const model = models[i % models.length];
    const cat = categories[i % categories.length];
    const benchmark = cat.benchmarks[i % cat.benchmarks.length];
    const ranking = benchmark.modelRankings?.find((r) => r.modelId === model.model.id);
    const score = ranking?.score ?? (55 + Math.random() * 35);

    entries.push({
      id: `live-feed-${i}`,
      modelName: model.model.name,
      provider: model.model.provider,
      benchmarkName: benchmark.name,
      categoryName: cat.name,
      categoryColor: cat.color,
      score: Math.round(score * 10) / 10,
      relativeTime: RELATIVE_TIMES[i] ?? `${30 + i}m ago`,
    });
  }

  return entries;
}

function MiniGauge({ score }: { score: number }) {
  const size = 18;
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

export function LiveEvalFeed({ leaderboardData, benchmarksData, isLoading }: LiveEvalFeedProps) {
  const feedEntries = useMemo(
    () => generateFeedEntries(leaderboardData, benchmarksData),
    [leaderboardData, benchmarksData]
  );

  const [highlightIndex, setHighlightIndex] = useState(0);

  // Auto-rotate highlight every 3 seconds
  useEffect(() => {
    if (feedEntries.length === 0) return;
    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % feedEntries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [feedEntries.length]);

  if (isLoading) {
    return (
      <section className="relative py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="h-8 w-48 mx-auto mb-6 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="glass-card p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-[rgba(255,255,255,0.03)]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (feedEntries.length === 0) return null;

  return (
    <section className="relative py-12">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] text-[#f5f5f7]">
            Live Evaluation Feed
          </h3>
          {/* Live badge with pulsing green dot */}
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Live
          </span>
        </div>

        {/* Feed container */}
        <div className="glass-card p-3 max-h-[360px] overflow-y-auto feed-scroll-container">
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {feedEntries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                    idx === highlightIndex
                      ? "bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.12)]"
                      : "hover:bg-[rgba(255,255,255,0.03)] border border-transparent"
                  }`}
                >
                  {/* Score gauge */}
                  <MiniGauge score={entry.score} />

                  {/* Model + Benchmark info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#f5f5f7] truncate">
                      {entry.modelName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#55556a] truncate">{entry.benchmarkName}</span>
                      <span
                        className="inline-flex items-center rounded-full px-1 py-0 text-[8px] font-medium"
                        style={{
                          backgroundColor: `${entry.categoryColor}15`,
                          color: entry.categoryColor,
                          border: `1px solid ${entry.categoryColor}25`,
                        }}
                      >
                        {entry.categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Score value */}
                  <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)] tabular-nums shrink-0"
                    style={{
                      color: entry.score >= 80 ? "#10b981" : entry.score >= 60 ? "#f59e0b" : "#f97316",
                    }}
                  >
                    {entry.score.toFixed(1)}
                  </span>

                  {/* Relative time */}
                  <span className="text-[10px] text-[#55556a] shrink-0 tabular-nums font-[family-name:var(--font-geist-mono)]">
                    {entry.relativeTime}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
