"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  HeartPulse,
  Landmark,
  Languages,
  GraduationCap,
  Search,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  SlidersHorizontal,
  Star,
  Bookmark,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import type { BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

/* ===== localStorage helpers (SSR-safe) ===== */
const BOOKMARKS_KEY = "indicbench-bm-bookmarks";
const RECENTLY_VIEWED_KEY = "indicbench-bm-recent";

function getBookmarks(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bm: string[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm));
  } catch {
    // noop
  }
}

interface RecentlyViewedItem {
  slug: string;
  name: string;
  timestamp: number;
}

function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentlyViewed(slug: string, name: string): void {
  try {
    if (typeof window === "undefined") return;
    const items = getRecentlyViewed();
    // Remove duplicate
    const filtered = items.filter((i) => i.slug !== slug);
    filtered.unshift({ slug, name, timestamp: Date.now() });
    // Keep last 5
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered.slice(0, 5)));
  } catch {
    // noop
  }
}

interface BenchmarkExplorerProps {
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

type SortKey = "name" | "difficulty" | "questions" | "topScore";
type ViewMode = "grid" | "list";

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

const DIFFICULTY_ORDER: Record<string, number> = { easy: 1, medium: 2, hard: 3, mixed: 0 };

/* ===== Empty State SVG Illustration ===== */
function EmptyStateIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" className="mx-auto mb-4 opacity-30">
      {/* Magnifying glass */}
      <circle cx="50" cy="35" r="20" fill="none" stroke="#8b8b9e" strokeWidth="2" />
      <line x1="65" y1="50" x2="80" y2="65" stroke="#8b8b9e" strokeWidth="2" strokeLinecap="round" />
      {/* Dots inside glass */}
      <circle cx="44" cy="30" r="2" fill="#55556a" />
      <circle cx="52" cy="28" r="1.5" fill="#55556a" />
      <circle cx="48" cy="38" r="1.5" fill="#55556a" />
      {/* Question mark */}
      <text x="46" y="37" fontSize="14" fill="#55556a" fontFamily="sans-serif" fontWeight="bold">?</text>
    </svg>
  );
}

/* ===== Bookmarks Empty SVG ===== */
function BookmarksEmptyIllustration() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto mb-2 opacity-30">
      <path d="M15 8 h30 v44 l-15 -10 l-15 10 z" fill="none" stroke="#8b8b9e" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="30" cy="25" r="6" fill="none" stroke="#55556a" strokeWidth="1.5" />
      <line x1="30" y1="22" x2="30" y2="28" stroke="#55556a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BenchmarkExplorer({ data, isLoading, onBenchmarkClick }: BenchmarkExplorerProps) {
  const categories = data?.categories ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Bookmarks state (initialize from localStorage via lazy initializer)
  const [bookmarks, setBookmarks] = useState<string[]>(() => getBookmarks());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Recently viewed state (initialize from localStorage via lazy initializer)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => getRecentlyViewed());

  // Category filter state (checkboxes)
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) initial[cat.slug] = true;
    return initial;
  });

  // Difficulty filter state (checkboxes)
  const [difficultyFilters, setDifficultyFilters] = useState<Record<string, boolean>>({
    easy: true,
    medium: true,
    hard: true,
    mixed: true,
  });

  // Flatten all benchmarks with their category info
  const allBenchmarks = useMemo(() => {
    const items: {
      id: string;
      slug: string;
      name: string;
      description: string;
      difficulty: string;
      numQuestions: number;
      categoryId: string;
      categorySlug: string;
      categoryName: string;
      categoryColor: string;
      topModelName: string | null;
      topModelScore: number | null;
    }[] = [];
    for (const cat of categories) {
      for (const bm of cat.benchmarks) {
        const topModel = bm.modelRankings?.[0];
        items.push({
          id: bm.id,
          slug: bm.slug,
          name: bm.name,
          description: bm.description,
          difficulty: bm.difficulty.toLowerCase(),
          numQuestions: bm.numQuestions,
          categoryId: cat.id,
          categorySlug: cat.slug,
          categoryName: cat.name,
          categoryColor: cat.color,
          topModelName: topModel?.modelName ?? null,
          topModelScore: topModel?.score ?? null,
        });
      }
    }
    return items;
  }, [categories]);

  // Determine "Recommended" benchmarks: those where the top model score is highest across all benchmarks
  const recommendedSlugs = useMemo(() => {
    if (allBenchmarks.length === 0) return new Set<string>();
    // Sort by topModelScore descending, take top 3
    const sorted = [...allBenchmarks]
      .filter((bm) => bm.topModelScore != null)
      .sort((a, b) => (b.topModelScore ?? 0) - (a.topModelScore ?? 0));
    return new Set(sorted.slice(0, 3).map((bm) => bm.slug));
  }, [allBenchmarks]);

  // Toggle bookmark
  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      saveBookmarks(next);
      return next;
    });
  }, []);

  // Handle benchmark click with recently viewed tracking
  const handleBenchmarkClick = useCallback((slug: string, name: string) => {
    addRecentlyViewed(slug, name);
    setRecentlyViewed(getRecentlyViewed());
    onBenchmarkClick(slug);
  }, [onBenchmarkClick]);

  // Filter
  const filteredBenchmarks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allBenchmarks.filter((bm) => {
      if (query && !bm.name.toLowerCase().includes(query) && !bm.categoryName.toLowerCase().includes(query)) return false;
      if (!categoryFilters[bm.categorySlug]) return false;
      if (!difficultyFilters[bm.difficulty]) return false;
      if (showBookmarksOnly && !bookmarks.includes(bm.slug)) return false;
      return true;
    });
  }, [allBenchmarks, searchQuery, categoryFilters, difficultyFilters, showBookmarksOnly, bookmarks]);

  // Sort
  const sortedBenchmarks = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1;
    return [...filteredBenchmarks].sort((a, b) => {
      if (sortKey === "name") return mul * a.name.localeCompare(b.name);
      if (sortKey === "difficulty") return mul * ((DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));
      if (sortKey === "questions") return mul * (a.numQuestions - b.numQuestions);
      if (sortKey === "topScore") return mul * ((a.topModelScore ?? 0) - (b.topModelScore ?? 0));
      return 0;
    });
  }, [filteredBenchmarks, sortKey, sortDir]);

  const toggleCategory = (slug: string) => {
    setCategoryFilters((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleDifficulty = (diff: string) => {
    setDifficultyFilters((prev) => ({ ...prev, [diff]: !prev[diff] }));
  };

  const selectAllCategories = () => {
    const all: Record<string, boolean> = {};
    for (const cat of categories) all[cat.slug] = true;
    setCategoryFilters(all);
  };

  const clearAllCategories = () => {
    const none: Record<string, boolean> = {};
    for (const cat of categories) none[cat.slug] = false;
    setCategoryFilters(none);
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-center text-[#8b8b9e]"
          >
            Loading benchmarks…
          </motion.p>
          <div className="glass-card p-3 mb-6 !rounded-xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 w-[130px] rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="hidden sm:block shrink-0">
              <div className="glass-card p-4 !rounded-xl w-[200px] space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="benchmarks" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="06" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Benchmark Explorer
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-center text-[#8b8b9e]"
        >
          Filter, sort, and explore all benchmarks across India&apos;s critical domains
        </motion.p>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-[#55556a]" />
              <span className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider">Recently Viewed</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentlyViewed.map((rv) => (
                <button
                  key={rv.slug}
                  onClick={() => handleBenchmarkClick(rv.slug, rv.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[11px] font-medium text-[#8b8b9e] hover:text-[#f59e0b] hover:!border-[rgba(245,158,11,0.3)] transition-all"
                >
                  <Clock className="h-2.5 w-2.5" />
                  {rv.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card p-3 mb-6 !rounded-xl"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556a]" />
              <input
                type="text"
                placeholder="Search benchmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-xs text-[#f5f5f7] placeholder:text-[#55556a] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg focus:outline-none focus:border-[rgba(245,158,11,0.3)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556a] hover:text-[#f5f5f7] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#55556a] shrink-0" />
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="h-8 text-xs bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#f5f5f7] w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark-dialog-content">
                  <SelectItem value="name" className="text-xs">Name</SelectItem>
                  <SelectItem value="difficulty" className="text-xs">Difficulty</SelectItem>
                  <SelectItem value="questions" className="text-xs">Questions</SelectItem>
                  <SelectItem value="topScore" className="text-xs">Top Score</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
                className="h-8 px-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[10px] font-medium text-[#8b8b9e] hover:text-[#f5f5f7] transition-all"
              >
                {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-[rgba(255,255,255,0.08)] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]" : "text-[#55556a] hover:text-[#8b8b9e]"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]" : "text-[#55556a] hover:text-[#8b8b9e]"}`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bookmark Toggle */}
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showBookmarksOnly ? "border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] text-[#f59e0b]" : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#8b8b9e] hover:text-[#f5f5f7]"}`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {bookmarks.length > 0 && (
                <span className="font-[family-name:var(--font-geist-mono)]">{bookmarks.length}</span>
              )}
            </button>

            {/* Filter Toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showFilters ? "border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] text-[#f59e0b]" : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#8b8b9e]"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>

          {/* Result count */}
          <div className="mt-2 text-xs text-[#55556a]">
            Showing <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">{sortedBenchmarks.length}</span> of{" "}
            <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">{allBenchmarks.length}</span> benchmarks
            {showBookmarksOnly && (
              <span className="ml-2 text-[#f59e0b]">★ Bookmarked only</span>
            )}
          </div>
        </motion.div>

        {/* Filter sidebar (desktop) / collapsible (mobile) */}
        <div className="flex gap-6">
          {/* Sidebar filters - always visible on desktop, collapsible on mobile */}
          <AnimatePresence>
            {(showFilters || typeof window !== "undefined") && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className={`shrink-0 ${showFilters ? "block" : "hidden"} sm:block`}
              >
                <div className="glass-card p-4 !rounded-xl w-[200px] sticky top-24 space-y-4">
                  {/* Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider">Categories</h5>
                      <div className="flex gap-1">
                        <button onClick={selectAllCategories} className="text-[9px] text-[#f59e0b] hover:text-[#fbbf24]">All</button>
                        <button onClick={clearAllCategories} className="text-[9px] text-[#55556a] hover:text-[#8b8b9e]">None</button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {categories.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat.slug] || Scale;
                        return (
                          <label key={cat.slug} className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              checked={categoryFilters[cat.slug] ?? true}
                              onCheckedChange={() => toggleCategory(cat.slug)}
                              className="data-[state=checked]:bg-[rgba(245,158,11,0.2)] data-[state=checked]:border-[#f59e0b]"
                            />
                            <Icon className="h-3 w-3 text-[#55556a] group-hover:text-[#8b8b9e] transition-colors" />
                            <span className="text-[11px] text-[#8b8b9e] group-hover:text-[#f5f5f7] transition-colors truncate">{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <h5 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2">Difficulty</h5>
                    <div className="space-y-1.5">
                      {(["easy", "medium", "hard"] as const).map((diff) => {
                        const config = DIFFICULTY_CONFIG[diff];
                        return (
                          <label key={diff} className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              checked={difficultyFilters[diff] ?? true}
                              onCheckedChange={() => toggleDifficulty(diff)}
                              className="data-[state=checked]:bg-[rgba(245,158,11,0.2)] data-[state=checked]:border-[#f59e0b]"
                            />
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                            <span className="text-[11px] text-[#8b8b9e] group-hover:text-[#f5f5f7] transition-colors">{config.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bookmarks */}
                  {bookmarks.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2">Bookmarks</h5>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {bookmarks.map((slug) => {
                          const bm = allBenchmarks.find((b) => b.slug === slug);
                          return bm ? (
                            <button
                              key={slug}
                              onClick={() => handleBenchmarkClick(bm.slug, bm.name)}
                              className="flex items-center gap-1.5 w-full text-left group"
                            >
                              <Bookmark className="h-2.5 w-2.5 text-[#f59e0b] shrink-0" />
                              <span className="text-[11px] text-[#8b8b9e] group-hover:text-[#f59e0b] transition-colors truncate">{bm.name}</span>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {sortedBenchmarks.length === 0 ? (
              <div className="glass-card p-8 text-center max-w-md mx-auto">
                {showBookmarksOnly ? (
                  <>
                    <BookmarksEmptyIllustration />
                    <p className="text-sm text-[#8b8b9e] mb-1">No bookmarked benchmarks yet</p>
                    <p className="text-xs text-[#55556a] mb-3">Click the ★ icon on any benchmark to save it here</p>
                    <button
                      onClick={() => setShowBookmarksOnly(false)}
                      className="text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
                    >
                      Show all benchmarks
                    </button>
                  </>
                ) : (
                  <>
                    <EmptyStateIllustration />
                    <p className="text-sm text-[#8b8b9e] mb-1">No benchmarks match your filters</p>
                    <p className="text-xs text-[#55556a] mb-3">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => { setSearchQuery(""); selectAllCategories(); setDifficultyFilters({ easy: true, medium: true, hard: true, mixed: true }); setShowBookmarksOnly(false); }}
                      className="text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
                    >
                      Reset filters
                    </button>
                  </>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedBenchmarks.map((bm, i) => {
                  const diff = DIFFICULTY_CONFIG[bm.difficulty] || DIFFICULTY_CONFIG.mixed;
                  const Icon = CATEGORY_ICONS[bm.categorySlug] || Scale;
                  const isBookmarked = bookmarks.includes(bm.slug);
                  const isRecommended = recommendedSlugs.has(bm.slug);
                  return (
                    <motion.div
                      key={bm.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.3) }}
                    >
                      <div
                        className="group cursor-pointer glass-card glass-card-hover p-4 relative overflow-hidden"
                        style={{ borderLeftWidth: "3px", borderLeftColor: `${bm.categoryColor}50` }}
                        onClick={() => handleBenchmarkClick(bm.slug, bm.name)}
                      >
                        {/* Recommended badge */}
                        {isRecommended && (
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]">
                              <Award className="h-2.5 w-2.5" />
                              Top
                            </span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm text-[#f5f5f7] group-hover:text-[#f59e0b] transition-colors">
                            {bm.name}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diff.color }} />
                              {bm.difficulty}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#55556a] line-clamp-2 mb-3 leading-relaxed">
                          {bm.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">{bm.numQuestions} Qs</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#55556a]">
                            <Icon className="h-3 w-3" style={{ color: bm.categoryColor }} />
                            {bm.categoryName}
                          </span>
                          {bm.topModelScore != null && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[10px] text-[#8b8b9e] truncate max-w-[60px]">{bm.topModelName}</span>
                              <MiniGauge score={bm.topModelScore} />
                            </div>
                          )}
                        </div>
                        {/* Bookmark button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(bm.slug); }}
                          className={`absolute bottom-2 right-2 p-1 rounded-md transition-all ${isBookmarked ? "text-[#f59e0b]" : "text-[#55556a] opacity-0 group-hover:opacity-100 hover:text-[#f59e0b]"}`}
                          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        >
                          <Star className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="glass-card overflow-hidden !rounded-xl">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[10px] font-medium text-[#55556a] uppercase tracking-wider">
                  <div className="w-6" />
                  <div className="flex-1 min-w-[140px]">Benchmark</div>
                  <div className="w-20 hidden sm:block">Category</div>
                  <div className="w-16 text-center">Difficulty</div>
                  <div className="w-14 text-right">Qs</div>
                  <div className="w-16 text-right hidden sm:block">Top Score</div>
                  <div className="w-8" />
                  <div className="w-6" />
                </div>
                {/* Rows */}
                <div className="max-h-[600px] overflow-y-auto">
                  {sortedBenchmarks.map((bm, i) => {
                    const diff = DIFFICULTY_CONFIG[bm.difficulty] || DIFFICULTY_CONFIG.mixed;
                    const scoreColor = bm.topModelScore != null
                      ? (bm.topModelScore >= 80 ? "#10b981" : bm.topModelScore >= 60 ? "#f59e0b" : "#f97316")
                      : "#55556a";
                    const isBookmarked = bookmarks.includes(bm.slug);
                    const isRecommended = recommendedSlugs.has(bm.slug);
                    return (
                      <motion.div
                        key={bm.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                        className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                        style={{ borderLeftWidth: "2px", borderLeftColor: `${bm.categoryColor}40` }}
                        onClick={() => handleBenchmarkClick(bm.slug, bm.name)}
                      >
                        {/* Bookmark star */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(bm.slug); }}
                          className={`shrink-0 p-0.5 transition-all ${isBookmarked ? "text-[#f59e0b]" : "text-[#55556a] hover:text-[#f59e0b]"}`}
                          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        >
                          <Star className={`h-3 w-3 ${isBookmarked ? "fill-current" : ""}`} />
                        </button>
                        <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-[#f5f5f7] group-hover:text-[#f59e0b]">{bm.name}</span>
                            {isRecommended && (
                              <span className="inline-flex items-center gap-0.5 rounded-full px-1 py-0 text-[7px] font-bold bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]">
                                <Sparkles className="h-2 w-2" />
                                Top
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#55556a] line-clamp-1">{bm.description}</div>
                        </div>
                        <div className="w-20 hidden sm:block text-[10px] text-[#8b8b9e] truncate">{bm.categoryName}</div>
                        <div className="w-16 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
                            {bm.difficulty}
                          </span>
                        </div>
                        <div className="w-14 text-right text-xs text-[#8b8b9e] font-[family-name:var(--font-geist-mono)] tabular-nums">{bm.numQuestions}</div>
                        <div className="w-16 text-right hidden sm:block text-xs font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color: scoreColor }}>
                          {bm.topModelScore != null ? bm.topModelScore.toFixed(1) : "—"}
                        </div>
                        <div className="w-8">
                          {bm.topModelScore != null && <MiniGauge score={bm.topModelScore} size={20} />}
                        </div>
                        <div className="w-6 shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
