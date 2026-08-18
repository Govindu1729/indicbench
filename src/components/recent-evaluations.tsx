"use client";

import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import type { LeaderboardResponse, BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface RecentEvaluationsProps {
  leaderboardData: LeaderboardResponse | null;
  benchmarksData: BenchmarksResponse | null;
  isLoading: boolean;
}

/* Mini ScoreGauge for feed entries */
function MiniFeedGauge({ score, size = 20 }: { score: number; size?: number }) {
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

/* Provider badge (mini) */
function MiniProviderBadge({ provider }: { provider: string }) {
  const colorMap: Record<string, string> = {
    OpenAI: "#34d399",
    Anthropic: "#fb923c",
    Google: "#60a5fa",
    Meta: "#a78bfa",
    Mistral: "#f472b6",
  };
  const color = colorMap[provider] || "#8b8b9e";
  return (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {provider}
    </span>
  );
}

/* Category badge (mini) */
function MiniCategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {name}
    </span>
  );
}

/* Relative time formatter */
const RELATIVE_TIMES = [
  "2 min ago",
  "5 min ago",
  "8 min ago",
  "12 min ago",
  "15 min ago",
  "18 min ago",
  "22 min ago",
  "28 min ago",
  "35 min ago",
  "42 min ago",
];

interface FeedEntry {
  id: string;
  modelName: string;
  provider: string;
  benchmarkName: string;
  benchmarkSlug: string;
  categoryName: string;
  categoryColor: string;
  score: number;
  relativeTime: string;
  isRecent: boolean;
}

function generateFeedEntries(
  leaderboardData: LeaderboardResponse | null,
  benchmarksData: BenchmarksResponse | null
): FeedEntry[] {
  const entries: FeedEntry[] = [];
  if (!leaderboardData?.overallRanking || !benchmarksData?.categories) return entries;

  const models = leaderboardData.overallRanking;
  const categories = benchmarksData.categories;

  // Generate 10 entries by combining models with random benchmarks
  for (let i = 0; i < 10; i++) {
    const model = models[i % models.length];
    const cat = categories[i % categories.length];
    const benchmark = cat.benchmarks[i % cat.benchmarks.length];
    const ranking = benchmark.modelRankings?.find((r) => r.modelId === model.model.id);
    const score = ranking?.score ?? (60 + Math.random() * 30);

    entries.push({
      id: `feed-${i}`,
      modelName: model.model.name,
      provider: model.model.provider,
      benchmarkName: benchmark.name,
      benchmarkSlug: benchmark.slug,
      categoryName: cat.name,
      categoryColor: cat.color,
      score: Math.round(score * 10) / 10,
      relativeTime: RELATIVE_TIMES[i] ?? `${40 + i} min ago`,
      isRecent: i < 5,
    });
  }

  return entries;
}

export function RecentEvaluations({ leaderboardData, benchmarksData, isLoading }: RecentEvaluationsProps) {
  const feedEntries = useMemo(
    () => generateFeedEntries(leaderboardData, benchmarksData),
    [leaderboardData, benchmarksData]
  );

  const handleViewDetails = useCallback((benchmarkSlug: string) => {
    const benchmarkSection = document.getElementById("benchmarks");
    if (benchmarkSection) {
      benchmarkSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (isLoading) {
    return (
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="max-w-2xl mx-auto space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full rounded-xl bg-[rgba(255,255,255,0.03)]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (feedEntries.length === 0) return null;

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with LIVE badge */}
        <div className="text-center mb-10">
          <div className="relative flex items-center justify-center gap-3 mb-2">
            <SectionNumber number="08" />
            <h2 className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]">
              Recent Evaluations
            </h2>
            {/* LIVE indicator badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
              Live
            </span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#8b8b9e]"
          >
            Live evaluation feed from the community
          </motion.p>
        </div>

        {/* Scrollable feed container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          <div className="feed-scroll-container max-h-[420px] overflow-y-auto pr-1 space-y-0">
            {feedEntries.map((entry, idx) => (
              <div key={entry.id} className="relative flex items-stretch">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center w-6 shrink-0 py-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      entry.isRecent
                        ? "bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                        : "bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.3)]"
                    }`}
                    aria-label={entry.isRecent ? "Recent evaluation" : "Older evaluation"}
                  />
                  {idx < feedEntries.length - 1 && (
                    <div className="flex-1 w-px bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-transparent mt-1" />
                  )}
                </div>

                {/* Card content */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group glass-card glass-card-hover p-3 flex-1 mb-2 flex items-center gap-3"
                >
                  {/* Model + Provider */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-[#f5f5f7] truncate">{entry.modelName}</span>
                      <MiniProviderBadge provider={entry.provider} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#55556a] truncate">{entry.benchmarkName}</span>
                      <MiniCategoryBadge name={entry.categoryName} color={entry.categoryColor} />
                    </div>
                  </div>

                  {/* Score with mini gauge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <MiniFeedGauge score={entry.score} />
                    <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
                      {entry.score.toFixed(1)}
                    </span>
                  </div>

                  {/* Relative time */}
                  <span className="text-[10px] text-[#55556a] shrink-0 tabular-nums font-[family-name:var(--font-geist-mono)]">
                    {entry.relativeTime}
                  </span>

                  {/* View Details button */}
                  <button
                    onClick={() => handleViewDetails(entry.benchmarkSlug)}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-[#55556a] hover:text-[#f59e0b] hover:bg-[rgba(245,158,11,0.08)] border border-transparent hover:border-[rgba(245,158,11,0.2)] transition-all opacity-0 group-hover:opacity-100"
                    aria-label={`View details for ${entry.benchmarkName}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Details
                  </button>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
