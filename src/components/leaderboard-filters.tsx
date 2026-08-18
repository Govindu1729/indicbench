"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { LeaderboardResponse, Category } from "@/lib/api";

/* ===== localStorage helpers (SSR-safe) ===== */
const FILTER_KEY = "indicbench-lb-filters";

interface SavedFilters {
  providers: string[];
  scoreRange: [number, number];
  tiers: string[];
  sortBy: string;
  visibleColumns: string[];
}

function getSavedFilters(): SavedFilters | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(FILTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveFilters(filters: SavedFilters): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  } catch {
    // noop
  }
}

const ALL_PROVIDERS = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral"];
const ALL_TIERS = ["S", "A", "B", "C"];
const SORT_OPTIONS = [
  { value: "score", label: "Score" },
  { value: "name", label: "Name" },
  { value: "provider", label: "Provider" },
  { value: "costEfficiency", label: "Cost Efficiency" },
  { value: "latency", label: "Latency" },
];

interface LeaderboardFiltersProps {
  data: LeaderboardResponse | null;
  categories: Category[];
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  providers: string[];
  scoreRange: [number, number];
  tiers: string[];
  sortBy: string;
  visibleColumns: string[];
}

const DEFAULT_FILTERS: SavedFilters = {
  providers: ALL_PROVIDERS,
  scoreRange: [0, 100],
  tiers: ALL_TIERS,
  sortBy: "score",
  visibleColumns: [],
};

export function LeaderboardFilters({
  data,
  categories,
  onFiltersChange,
}: LeaderboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize from localStorage or defaults
  const [providers, setProviders] = useState<string[]>(() => {
    const saved = getSavedFilters();
    return saved?.providers ?? DEFAULT_FILTERS.providers;
  });
  const [scoreRange, setScoreRange] = useState<[number, number]>(() => {
    const saved = getSavedFilters();
    return saved?.scoreRange ?? DEFAULT_FILTERS.scoreRange;
  });
  const [tiers, setTiers] = useState<string[]>(() => {
    const saved = getSavedFilters();
    return saved?.tiers ?? DEFAULT_FILTERS.tiers;
  });
  const [sortBy, setSortBy] = useState<string>(() => {
    const saved = getSavedFilters();
    return saved?.sortBy ?? DEFAULT_FILTERS.sortBy;
  });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = getSavedFilters();
    if (saved?.visibleColumns && saved.visibleColumns.length > 0) {
      return saved.visibleColumns;
    }
    // Will be populated via useMemo below when categories are available
    return [];
  });

  // Tier color map
  const tierConfig: Record<string, { color: string; bg: string }> = {
    S: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    A: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
    B: { color: "#d97706", bg: "rgba(217,119,6,0.12)" },
    C: { color: "#8b8b9e", bg: "rgba(139,139,158,0.08)" },
  };

  // Derive available category slugs from data
  const categorySlugs = useMemo(
    () => categories.map((c) => c.slug),
    [categories]
  );

  // Resolve visibleColumns: if empty, default to all categories
  const resolvedVisibleColumns = useMemo(
    () => visibleColumns.length > 0 ? visibleColumns : categorySlugs,
    [visibleColumns, categorySlugs]
  );

  // Persist and notify
  useEffect(() => {
    const cols = resolvedVisibleColumns;
    const filterState: SavedFilters = {
      providers,
      scoreRange,
      tiers,
      sortBy,
      visibleColumns: cols,
    };
    saveFilters(filterState);
    onFiltersChange({
      providers,
      scoreRange,
      tiers,
      sortBy,
      visibleColumns: cols,
    });
  }, [providers, scoreRange, tiers, sortBy, resolvedVisibleColumns, onFiltersChange]);

  const toggleProvider = useCallback((p: string) => {
    setProviders((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }, []);

  const toggleTier = useCallback((t: string) => {
    setTiers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }, []);

  const toggleColumn = useCallback((slug: string) => {
    setVisibleColumns((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setProviders(ALL_PROVIDERS);
    setScoreRange([0, 100]);
    setTiers(ALL_TIERS);
    setSortBy("score");
    setVisibleColumns(categorySlugs);
  }, [categorySlugs]);

  const isDefault =
    providers.length === ALL_PROVIDERS.length &&
    scoreRange[0] === 0 &&
    scoreRange[1] === 100 &&
    tiers.length === ALL_TIERS.length &&
    sortBy === "score";

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (providers.length < ALL_PROVIDERS.length) count++;
    if (scoreRange[0] > 0 || scoreRange[1] < 100) count++;
    if (tiers.length < ALL_TIERS.length) count++;
    if (sortBy !== "score") count++;
    if (resolvedVisibleColumns.length < categorySlugs.length) count++;
    return count;
  }, [providers, scoreRange, tiers, sortBy, resolvedVisibleColumns, categorySlugs]);

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card glass-card-hover text-xs font-medium text-[#f5f5f7] hover:!border-[rgba(245,158,11,0.4)] hover:!text-[#f59e0b] transition-all"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[rgba(245,158,11,0.2)] text-[10px] font-bold text-[#f59e0b]">
            {activeFilterCount}
          </span>
        )}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      {/* Collapsible Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 !rounded-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f5f5f7]">
                  Advanced Filtering
                </h3>
                <div className="flex items-center gap-2">
                  {!isDefault && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#f59e0b] hover:text-[#fbbf24] border border-[rgba(245,158,11,0.2)] hover:border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.06)] transition-all"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset Filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-[#55556a] hover:text-[#f5f5f7] transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Provider Filter */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2.5">
                    Provider
                  </h4>
                  <div className="space-y-1.5">
                    {ALL_PROVIDERS.map((p) => (
                      <label
                        key={p}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <Checkbox
                          checked={providers.includes(p)}
                          onCheckedChange={() => toggleProvider(p)}
                          className="data-[state=checked]:bg-[rgba(245,158,11,0.2)] data-[state=checked]:border-[#f59e0b]"
                        />
                        <span className="text-xs text-[#8b8b9e] group-hover:text-[#f5f5f7] transition-colors">
                          {p}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Score Range Filter */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2.5">
                    Score Range
                  </h4>
                  <div className="space-y-3 px-1">
                    <Slider
                      value={scoreRange}
                      onValueChange={(v) =>
                        setScoreRange(v as [number, number])
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="[&_[data-slot=slider-track]]:bg-[rgba(255,255,255,0.08)] [&_[data-slot=slider-range]]:bg-[#f59e0b] [&_[data-slot=slider-thumb]]:border-[#f59e0b] [&_[data-slot=slider-thumb]]:bg-[#0a0a0f]"
                    />
                    <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-geist-mono)] tabular-nums">
                      <span className="text-[#8b8b9e]">{scoreRange[0]}</span>
                      <span className="text-[#55556a]">—</span>
                      <span className="text-[#8b8b9e]">{scoreRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Tier Filter */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2.5">
                    Tier
                  </h4>
                  <div className="space-y-1.5">
                    {ALL_TIERS.map((t) => {
                      const cfg = tierConfig[t];
                      return (
                        <label
                          key={t}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Checkbox
                            checked={tiers.includes(t)}
                            onCheckedChange={() => toggleTier(t)}
                            className="data-[state=checked]:bg-[rgba(245,158,11,0.2)] data-[state=checked]:border-[#f59e0b]"
                          />
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                            }}
                          >
                            {t}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Sort By */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2.5">
                    Sort By
                  </h4>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 text-xs bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#f5f5f7] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark-dialog-content">
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Column Visibility */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#8b8b9e] uppercase tracking-wider mb-2.5">
                    Visible Columns
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isVisible = resolvedVisibleColumns.includes(cat.slug);
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => toggleColumn(cat.slug)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                            isVisible
                              ? "border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] text-[#f59e0b]"
                              : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#55556a] hover:text-[#8b8b9e]"
                          }`}
                        >
                          {isVisible ? (
                            <Eye className="h-2.5 w-2.5" />
                          ) : (
                            <EyeOff className="h-2.5 w-2.5" />
                          )}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active filter summary */}
              {!isDefault && (
                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="flex flex-wrap gap-1.5">
                    {providers.length < ALL_PROVIDERS.length && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-[rgba(245,158,11,0.08)] text-[#f59e0b] border border-[rgba(245,158,11,0.15)]">
                        Provider: {providers.join(", ")}
                      </span>
                    )}
                    {(scoreRange[0] > 0 || scoreRange[1] < 100) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-[rgba(245,158,11,0.08)] text-[#f59e0b] border border-[rgba(245,158,11,0.15)]">
                        Score: {scoreRange[0]}–{scoreRange[1]}
                      </span>
                    )}
                    {tiers.length < ALL_TIERS.length && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-[rgba(245,158,11,0.08)] text-[#f59e0b] border border-[rgba(245,158,11,0.15)]">
                        Tier: {tiers.join(", ")}
                      </span>
                    )}
                    {sortBy !== "score" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-[rgba(245,158,11,0.08)] text-[#f59e0b] border border-[rgba(245,158,11,0.15)]">
                        Sort:{" "}
                        {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
