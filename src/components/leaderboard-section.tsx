"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Download, Loader2, Search, X, Star, Share2, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import type { LeaderboardResponse, OverallRankingEntry, Category } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";
import { ModelTierBadge } from "@/components/model-tier-badge";
import { ScoreGauge, ProviderBadge } from "@/components/shared-ui";
import { ScoreContextTooltip } from "@/components/score-context-tooltip";

/* ===== localStorage helpers for favorites (SSR-safe) ===== */
const FAVS_KEY = "indicbench-favorites";
function getFavorites(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(FAVS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function setFavorites(favs: string[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  } catch {
    // noop
  }
}

interface LeaderboardSectionProps {
  data: LeaderboardResponse | null;
  isLoading: boolean;
  activeCategory: string | null;
  onCategoryChange: (slug: string) => void;
  onModelClick?: (modelId: string, modelName: string) => void;
}



/* ===== Mini Sparkline for score trend ===== */
function MiniSparkline({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  // Generate 5 trend points based on score with small random variation
  const points = useMemo(() => {
    const base = score;
    const seed = Math.round(score * 7.3); // deterministic-ish per score
    const variations = [seed % 5 - 2, (seed * 3) % 5 - 2, (seed * 7) % 5 - 2, (seed * 11) % 5 - 2, 0];
    return variations.map((v) => Math.max(0, Math.min(100, base + v)));
  }, [score]);

  // Map to 24x12 SVG
  const w = 24;
  const h = 12;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h * 0.8 - h * 0.1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={w} height={h} className="shrink-0 opacity-70">
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ===== SVG Medal for rank 1-3 ===== */
function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" className="medal-gold shrink-0">
        <circle cx="14" cy="14" r="12" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="14" y="14" textAnchor="middle" dominantBaseline="central" fill="#fbbf24" fontSize="12" fontWeight="700" fontFamily="var(--font-geist-mono)">1</text>
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" className="medal-silver shrink-0">
        <circle cx="14" cy="14" r="12" fill="#94a3b820" stroke="#94a3b8" strokeWidth="1.5" />
        <text x="14" y="14" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="12" fontWeight="700" fontFamily="var(--font-geist-mono)">2</text>
      </svg>
    );
  }
  if (rank === 3) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" className="medal-bronze shrink-0">
        <circle cx="14" cy="14" r="12" fill="#d9770620" stroke="#d97706" strokeWidth="1.5" />
        <text x="14" y="14" textAnchor="middle" dominantBaseline="central" fill="#d97706" fontSize="12" fontWeight="700" fontFamily="var(--font-geist-mono)">3</text>
      </svg>
    );
  }
  return (
    <span className="text-sm text-[#55556a] font-[family-name:var(--font-geist-mono)] tabular-nums w-7 text-center">{rank}</span>
  );
}



/* ===== Category Score Pill ===== */
function CategoryScorePill({ value }: { value: number | undefined | null }) {
  if (value == null) return <span className="text-[#55556a] text-xs">—</span>;
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : value >= 40 ? "#f97316" : "#ef4444";
  return (
    <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color }}>{value.toFixed(1)}</span>
  );
}

/* ===== Row hover glow color based on rank ===== */
function getRowGlowColor(rank: number): string {
  if (rank === 1) return "rgba(251, 191, 36, 0.15)"; // gold
  if (rank === 2) return "rgba(148, 163, 184, 0.12)"; // silver
  if (rank === 3) return "rgba(217, 119, 6, 0.12)"; // bronze
  return "rgba(245, 158, 11, 0.08)"; // saffron for others
}

const ROW_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

export function LeaderboardSection({
  data,
  isLoading,
  activeCategory,
  onCategoryChange,
  onModelClick,
}: LeaderboardSectionProps) {
  const [sortKey, setSortKey] = useState<"overallScore" | "rank">("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [shareAnimating, setShareAnimating] = useState(false);
  const [compareSelected, setCompareSelected] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    setFavoritesState(getFavorites());
  }, []);

  const toggleFavorite = useCallback((modelId: string) => {
    setFavoritesState((prev) => {
      const next = prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId];
      setFavorites(next);
      return next;
    });
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-leaderboard");
      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indicbench-leaderboard.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Leaderboard exported", {
        description: "indicbench-leaderboard.csv downloaded",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Export failed", { description: message });
    } finally {
      setExporting(false);
    }
  }, []);

  const categories: Category[] = useMemo(() => data?.categories ?? [], [data]);

  const ranking: OverallRankingEntry[] = useMemo(() => {
    if (!data?.overallRanking) return [];
    return [...data.overallRanking].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "rank") return mul * (a.rank - b.rank);
      return mul * (a.overallScore - b.overallScore);
    });
  }, [data, sortKey, sortDir]);

  // Filter by search query and favorites tab
  const filteredRanking = useMemo(() => {
    let result = ranking;
    // Favorites filter
    if (showFavorites) {
      result = result.filter((entry) => favorites.includes(entry.model.id));
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.model.name.toLowerCase().includes(q) ||
          entry.model.provider.toLowerCase().includes(q)
      );
    }
    return result;
  }, [ranking, searchQuery, showFavorites, favorites]);

  const totalModelCount = ranking.length;

  const toggleSort = (key: "overallScore" | "rank") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  };

  const tabValue = showFavorites ? "favorites" : (activeCategory || "overall");
  const allTabs = [
    { slug: "overall", name: "Overall" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
    { slug: "favorites", name: `★ Favorites${favorites.length > 0 ? ` (${favorites.length})` : ""}` },
  ];

  if (isLoading) {
    return (
      <section id="leaderboard" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="h-10 w-full max-w-lg mx-auto mb-6 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 w-full mb-2 rounded-lg bg-[rgba(255,255,255,0.03)]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="leaderboard" className="relative py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section title + Export button */}
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
          <div className="relative">
            <SectionNumber number="04" />
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center sm:text-left text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
            >
              Leaderboard
            </motion.h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Model count badge */}
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] text-[#10b981]">
              {totalModelCount} models
            </span>
            {/* Last updated timestamp */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#8b8b9e]">
              <span className="w-1 h-1 rounded-full bg-[#10b981]" />
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            {/* Share button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => {
                setShareAnimating(true);
                const url = new URL(window.location.href);
                if (activeCategory) url.searchParams.set("category", activeCategory);
                navigator.clipboard.writeText(url.toString()).then(() => {
                  toast.success("Link copied to clipboard!");
                }).catch(() => {
                  toast.error("Failed to copy link");
                }).finally(() => {
                  setTimeout(() => setShareAnimating(false), 400);
                });
              }}
              className="group inline-flex items-center justify-center gap-2 self-center sm:self-end rounded-xl glass-card glass-card-hover px-4 py-2 text-xs font-medium text-[#f5f5f7] hover:!border-[rgba(245,158,11,0.4)] hover:!text-[#f59e0b] hover:!shadow-[0_0_18px_rgba(245,158,11,0.12)] transition-all"
              aria-label="Share leaderboard link"
            >
              <Share2 className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${shareAnimating ? "scale-125" : ""}`} />
              Share
            </motion.button>

            {/* Export CSV button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onClick={handleExport}
              disabled={exporting}
              className="group inline-flex items-center justify-center gap-2 self-center sm:self-end rounded-xl glass-card glass-card-hover px-4 py-2 text-xs font-medium text-[#f5f5f7] hover:!border-[rgba(245,158,11,0.4)] hover:!text-[#f59e0b] hover:!shadow-[0_0_18px_rgba(245,158,11,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export leaderboard as CSV"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f59e0b]" />
              ) : (
                <Download className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
              )}
              {exporting ? "Exporting…" : "Export CSV"}
            </motion.button>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-[#8b8b9e]"
        >
          How do India&apos;s top AI models perform across critical domains?
        </motion.p>

        {/* Search input */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556a] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-card bg-transparent text-sm text-[#f5f5f7] placeholder:text-[#55556a] focus:outline-none focus:ring-2 focus:ring-[rgba(245,158,11,0.4)] focus:!border-[rgba(245,158,11,0.3)] transition-all"
              aria-label="Search models in leaderboard"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556a] hover:text-[#f5f5f7] transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Result count */}
          <div className="mt-2 text-center text-xs text-[#55556a]">
            Showing {filteredRanking.length} of {totalModelCount} models
            {showFavorites && favorites.length > 0 && " (favorites only)"}
          </div>
        </div>

        {/* Glass pill tab bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {allTabs.map((tab) => {
            const isActive = tabValue === tab.slug;
            return (
              <button
                key={tab.slug}
                className={`glass-pill ${isActive ? "glass-pill-active" : ""}`}
                onClick={() => {
                  if (tab.slug === "favorites") {
                    setShowFavorites(true);
                  } else {
                    setShowFavorites(false);
                    onCategoryChange(tab.slug === "overall" ? "" : tab.slug);
                  }
                }}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Custom glass table */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            {/* Compare checkbox column header */}
            <div className="w-8 flex justify-center">
              <GitCompareArrows className="h-3.5 w-3.5 text-[#55556a]" />
            </div>
            <div
              className="w-12 cursor-pointer select-none text-xs font-medium text-[#55556a] uppercase tracking-wider flex items-center gap-1"
              onClick={() => toggleSort("rank")}
            >
              # <ArrowUpDown className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-[140px] text-xs font-medium text-[#55556a] uppercase tracking-wider">Model</div>
            <div
              className="w-32 cursor-pointer select-none text-xs font-medium text-[#55556a] uppercase tracking-wider flex items-center gap-1"
              onClick={() => toggleSort("overallScore")}
            >
              Score <ArrowUpDown className="h-3 w-3" />
            </div>
            <div className="hidden md:block w-16 text-xs font-medium text-[#55556a] uppercase tracking-wider text-right">Legal</div>
            <div className="hidden md:block w-16 text-xs font-medium text-[#55556a] uppercase tracking-wider text-right">Health</div>
            <div className="hidden md:block w-16 text-xs font-medium text-[#55556a] uppercase tracking-wider text-right">Fintech</div>
            <div className="hidden lg:block w-16 text-xs font-medium text-[#55556a] uppercase tracking-wider text-right">Vernac.</div>
            <div className="hidden lg:block w-16 text-xs font-medium text-[#55556a] uppercase tracking-wider text-right">Edu.</div>
            <div className="hidden xl:block w-20 text-xs font-medium text-[#55556a] uppercase tracking-wider text-right">Benchmarks</div>
          </div>

          {/* Table body */}
          <AnimatePresence mode="popLayout">
            {filteredRanking.map((entry, i) => {
              const isTop3 = entry.rank <= 3;
              const rowClass = isTop3
                ? entry.rank === 1
                  ? "glass-row-top-1-enhanced"
                  : entry.rank === 2
                  ? "glass-row-top-2-enhanced"
                  : "glass-row-top-3-enhanced"
                : "";
              const isHovered = hoveredRowId === entry.model.id;
              const glowColor = getRowGlowColor(entry.rank);

              return (
                <motion.div
                  key={entry.model.id}
                  custom={i}
                  variants={ROW_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`flex items-center gap-4 px-5 py-3.5 glass-row row-shimmer ${rowClass} transition-all`}
                  style={{
                    boxShadow: isHovered ? `inset 3px 0 12px ${glowColor}` : undefined,
                  }}
                  onMouseEnter={() => setHoveredRowId(entry.model.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  {/* Compare checkbox */}
                  <div className="w-8 flex justify-center">
                    <Checkbox
                      checked={compareSelected.has(entry.model.id)}
                      onCheckedChange={(checked) => {
                        setCompareSelected((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add(entry.model.id);
                          else next.delete(entry.model.id);
                          return next;
                        });
                      }}
                      className="data-[state=checked]:bg-[rgba(245,158,11,0.2)] data-[state=checked]:border-[#f59e0b]"
                      aria-label={`Compare ${entry.model.name}`}
                    />
                  </div>

                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    <RankMedal rank={entry.rank} />
                  </div>

                  {/* Model name + provider + favorite */}
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <button
                        onClick={() => onModelClick?.(entry.model.id, entry.model.name)}
                        className="font-medium text-sm text-[#f5f5f7] hover:text-[#f59e0b] transition-colors text-left cursor-pointer"
                      >
                        {entry.model.name}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(entry.model.id); }}
                        className="shrink-0 transition-all hover:scale-110"
                        aria-label={favorites.includes(entry.model.id) ? `Remove ${entry.model.name} from favorites` : `Add ${entry.model.name} to favorites`}
                      >
                        <Star
                          className={`h-3.5 w-3.5 transition-colors ${
                            favorites.includes(entry.model.id)
                              ? "fill-[#fbbf24] text-[#fbbf24]"
                              : "text-[#55556a] hover:text-[#fbbf24]"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ProviderBadge provider={entry.model.provider} />
                      <ModelTierBadge score={entry.overallScore} size="sm" />
                    </div>
                  </div>

                  {/* Score with gauge + rich context tooltip */}
                  <div className="w-32 flex items-center gap-2">
                    <ScoreContextTooltip
                      score={entry.overallScore}
                      allScores={ranking.map((r) => r.overallScore)}
                      categoryScores={entry.categoryScores}
                      modelRank={entry.rank}
                      totalModels={ranking.length}
                    >
                      <div className="flex items-center gap-2 cursor-default">
                        <ScoreGauge score={entry.overallScore} size={32} strokeWidth={2.5} />
                        <MiniSparkline score={entry.overallScore} />
                        <span className="text-sm font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
                          {entry.overallScore.toFixed(1)}
                        </span>
                      </div>
                    </ScoreContextTooltip>
                  </div>

                  {/* Category scores */}
                  <div className="hidden md:block w-16 text-right">
                    <CategoryScorePill value={entry.categoryScores?.legal} />
                  </div>
                  <div className="hidden md:block w-16 text-right">
                    <CategoryScorePill value={entry.categoryScores?.healthcare} />
                  </div>
                  <div className="hidden md:block w-16 text-right">
                    <CategoryScorePill value={entry.categoryScores?.fintech} />
                  </div>
                  <div className="hidden lg:block w-16 text-right">
                    <CategoryScorePill value={entry.categoryScores?.vernacular} />
                  </div>
                  <div className="hidden lg:block w-16 text-right">
                    <CategoryScorePill value={entry.categoryScores?.education} />
                  </div>
                  <div className="hidden xl:block w-20 text-right text-xs text-[#55556a] font-[family-name:var(--font-geist-mono)] tabular-nums">
                    {entry.numBenchmarks}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredRanking.length === 0 && (
            <div className="py-12 text-center text-[#55556a]">
              {showFavorites
                ? "No favorited models yet. Click the ★ star next to a model name to add favorites."
                : searchQuery
                ? `No models matching "${searchQuery}"`
                : "No ranking data available for this category."}
            </div>
          )}
        </div>

        {/* Quick Comparison floating bar */}
        <AnimatePresence>
          {compareSelected.size >= 2 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
            >
              <div className="glass-card !rounded-2xl p-4 shadow-xl border border-[rgba(245,158,11,0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitCompareArrows className="h-4 w-4 text-[#f59e0b]" />
                    <span className="text-sm font-medium text-[#f5f5f7]">
                      Comparing {compareSelected.size} models
                    </span>
                  </div>
                  <button
                    onClick={() => setCompareSelected(new Set())}
                    className="text-xs text-[#55556a] hover:text-[#f5f5f7] transition-colors"
                    aria-label="Clear comparison selection"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(compareSelected.size, 4)}, minmax(0, 1fr))` }}>
                  {ranking
                    .filter((e) => compareSelected.has(e.model.id))
                    .map((entry) => {
                      const scoreColor = entry.overallScore >= 80 ? "#10b981" : entry.overallScore >= 60 ? "#f59e0b" : "#f97316";
                      return (
                        <div key={entry.model.id} className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium text-[#f5f5f7] truncate">{entry.model.name}</span>
                            <span className="text-lg font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color: scoreColor }}>
                              {entry.overallScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#55556a]">#{entry.rank} · {entry.model.provider}</div>
                          {/* Category mini-bars */}
                          <div className="space-y-1">
                            {Object.entries(entry.categoryScores || {}).map(([cat, val]) => (
                              <div key={cat} className="flex items-center gap-1.5">
                                <span className="w-10 text-[9px] text-[#55556a] truncate capitalize">{cat}</span>
                                <div className="flex-1 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                                  <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${val}%` }} />
                                </div>
                                <span className="text-[9px] font-[family-name:var(--font-geist-mono)] tabular-nums w-6 text-right" style={{ color: val >= 80 ? "#10b981" : val >= 60 ? "#f59e0b" : "#f97316" }}>
                                  {val.toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Powered by badge — more prominent with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass-card px-5 py-2 text-[10px] text-[#55556a] uppercase tracking-widest badge-live-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Powered by live evaluation
          </span>
        </motion.div>
      </div>
    </section>
  );
}
