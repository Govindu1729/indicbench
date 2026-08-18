"use client";

import { useState, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  Trophy,
  FlaskConical,
  BarChart3,
  Play,
  Info,
  Scale,
  HeartPulse,
  Landmark,
  Languages,
  GraduationCap,
  ArrowRight,
  Target,
  Shield,
  Zap,
  Globe,
  Flag,
} from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { HeroSection } from "@/components/hero-section";
import { CategoryCards } from "@/components/category-cards";
import { DifferentiatorsSection } from "@/components/differentiators-section";
import { IndiaCartogram } from "@/components/india-cartogram";
import { LeaderboardSection } from "@/components/leaderboard-section";
import { LeaderboardFilters } from "@/components/leaderboard-filters";
import { ModelCompare } from "@/components/model-compare";
import { BenchmarkExplorer } from "@/components/benchmark-explorer";
import { BenchmarkDialog } from "@/components/benchmark-dialog";
import { BenchmarkTimeline } from "@/components/benchmark-timeline";
import { ScorePredictor } from "@/components/score-predictor";
import { EvaluateSection } from "@/components/evaluate-section";
import { RecentEvaluations } from "@/components/recent-evaluations";
import { AboutSection } from "@/components/about-section";
import { SubmitBenchmark } from "@/components/submit-benchmark";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { ModelProfileDialog } from "@/components/model-profile-dialog";
import { PerformanceHeatmap } from "@/components/performance-heatmap";
import { ScoreDistribution } from "@/components/score-distribution";
import { BackToTop } from "@/components/back-to-top";
import { Confetti } from "@/components/confetti";
import { EvaluationHistory } from "@/components/evaluation-history";
import { ModelBattle } from "@/components/model-battle";
import { CategoryDeepDive } from "@/components/category-deep-dive";
import { AchievementBadges } from "@/components/achievement-badges";
import { DomainRadar } from "@/components/domain-radar";
import { CostAnalysis } from "@/components/cost-analysis";
import { LeaderboardSnapshot } from "@/components/leaderboard-snapshot";
import { DifficultyAnalysis } from "@/components/difficulty-analysis";
import { PerformanceSummaryCards } from "@/components/performance-summary-cards";
import { FeedbackWidget } from "@/components/feedback-widget";
import { ParticleNetwork } from "@/components/particle-network";
import { ModelCarousel } from "@/components/model-carousel";
import { CategoryDonutChart } from "@/components/category-donut-chart";
import { CategoryRingChart } from "@/components/category-ring-chart";
import { TrendsChart } from "@/components/trends-chart";
import { StatsDashboard } from "@/components/stats-dashboard";
import { InsightsSection } from "@/components/insights-section";
import { DataExportCenter } from "@/components/data-export-center";
import { LiveEvalFeed } from "@/components/live-eval-feed";
import {
  fetchStats,
  fetchLeaderboard,
  fetchBenchmarks,
  fetchModels,
} from "@/lib/api";
import type { FilterState } from "@/components/leaderboard-filters";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Tab definitions
type TabId = "overview" | "leaderboard" | "benchmarks" | "analytics" | "evaluate" | "about";

const TABS: { id: TabId; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon, shortLabel: "Home" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, shortLabel: "Ranks" },
  { id: "benchmarks", label: "Benchmarks", icon: FlaskConical, shortLabel: "Tests" },
  { id: "analytics", label: "Analytics", icon: BarChart3, shortLabel: "Stats" },
  { id: "evaluate", label: "Evaluate", icon: Play, shortLabel: "Run" },
  { id: "about", label: "About", icon: Info, shortLabel: "Info" },
];

// Topic-driven use case cards for Overview
const INDIAN_USE_CASES = [
  {
    icon: Scale,
    title: "Legal AI for India",
    description: "Indian Penal Code, Constitutional law, RTI queries — benchmarks built on real Indian legal scenarios, not generic Western law.",
    color: "#f59e0b",
    category: "Legal",
    examples: ["IPC Section 302 reasoning", "Constitutional amendment analysis", "Landmark case summarization"],
  },
  {
    icon: HeartPulse,
    title: "Healthcare for Bharat",
    description: "Ayushman Bharat schemes, rural health indicators, disease prevalence — AI that must serve 1.4 billion people's health needs.",
    color: "#10b981",
    category: "Healthcare",
    examples: ["National Health Policy QA", "Rural diagnosis assistance", "Telemedicine protocol adherence"],
  },
  {
    icon: Landmark,
    title: "Fintech × UPI India",
    description: "UPI transaction patterns, RBI regulations, Indian tax structures — AI for the world's largest digital payments ecosystem.",
    color: "#f97316",
    category: "Fintech",
    examples: ["UPI fraud detection", "RBI compliance checking", "GST calculation accuracy"],
  },
  {
    icon: Languages,
    title: "Vernacular AI",
    description: "22 scheduled languages, code-mixed Hinglish, Devanagari script — AI must understand India in its own languages.",
    color: "#8b5cf6",
    category: "Vernacular",
    examples: ["Hindi legal document parsing", "Tamil medical Q&A", "Code-mixed sentiment analysis"],
  },
  {
    icon: GraduationCap,
    title: "Education & NEP 2020",
    description: "NCERT curricula, board exam patterns, multilingual pedagogy — AI aligned with India's National Education Policy.",
    color: "#0d9488",
    category: "Education",
    examples: ["NCERT concept mastery", "Multilingual tutoring", "Competency-based assessment"],
  },
];

function IndicBenchApp() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dialogSlug, setDialogSlug] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modelProfileId, setModelProfileId] = useState<string | null>(null);
  const [modelProfileName, setModelProfileName] = useState<string | null>(null);
  const [modelProfileOpen, setModelProfileOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [leaderboardFilters, setLeaderboardFilters] = useState<FilterState | null>(null);

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", activeCategory],
    queryFn: () => fetchLeaderboard(activeCategory || undefined),
  });

  // Fetch benchmarks
  const { data: benchmarksData, isLoading: benchmarksLoading } = useQuery({
    queryKey: ["benchmarks"],
    queryFn: fetchBenchmarks,
  });

  // Fetch models
  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });

  const handleCategoryClick = useCallback((slug: string) => {
    setActiveCategory(slug || null);
  }, []);

  const handleBenchmarkClick = useCallback((slug: string) => {
    setDialogSlug(slug);
    setDialogOpen(true);
  }, []);

  const handleModelClick = useCallback((modelId: string, modelName: string) => {
    setModelProfileId(modelId);
    setModelProfileName(modelName);
    setModelProfileOpen(true);
  }, []);

  const handleEvalComplete = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  }, []);

  const handleFiltersChange = useCallback((filters: FilterState) => {
    setLeaderboardFilters(filters);
  }, []);

  const categoriesForCards = useMemo(
    () => statsData?.categories ?? leaderboardData?.categories ?? [],
    [statsData?.categories, leaderboardData?.categories]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Particle Network Background */}
      <ParticleNetwork />

      {/* Confetti Celebration */}
      <Confetti active={showConfetti} />

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Tab Navigation Bar (fixed) */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.92)] backdrop-blur-xl">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center h-14 sm:h-16 gap-1 sm:gap-2">
            {/* Logo */}
            <button
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2 mr-2 sm:mr-4 shrink-0"
            >
              <span className="text-base sm:text-lg font-bold font-[family-name:var(--font-playfair)] gradient-text-saffron whitespace-nowrap">
                IndicBench
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#8b8b9e]">
                v2.1
              </span>
            </button>

            {/* Tab Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.25)]"
                        : "text-[#8b8b9e] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.04)] border border-transparent"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {tab.id === "evaluate" && (
                      <span className="ml-0.5 inline-flex items-center rounded-full bg-[rgba(16,185,129,0.15)] px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider text-[#10b981] border border-[rgba(16,185,129,0.3)]">
                        NEW
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="tab-glow"
                        className="absolute inset-0 rounded-lg bg-[rgba(245,158,11,0.05)] pointer-events-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
              <button
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#55556a] hover:text-[#8b8b9e] text-xs transition-all"
                onClick={() => {
                  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true });
                  document.dispatchEvent(event);
                }}
              >
                <span>Search</span>
                <kbd className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[10px] font-[family-name:var(--font-geist-mono)]">⌘K</kbd>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Command Palette */}
      <CommandPalette />

      {/* Back to Top */}
      <BackToTop />

      {/* Main Content Area - Tab Panels */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Compact Hero */}
              <HeroSection stats={statsData?.totals ?? null} />

              {/* Mission Statement - Topic Driven */}
              <section className="relative py-12 md:py-16">
                <div className="absolute inset-0 mesh-gradient-section" />
                <div className="container mx-auto px-4 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 glass-card mb-4">
                      <Target className="h-3.5 w-3.5 text-[#f59e0b]" />
                      <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#f59e0b]">
                        Our Priority
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] mb-4">
                      Benchmarking AI for{" "}
                      <span className="gradient-text-saffron">Indian Use Cases</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#8b8b9e] leading-relaxed">
                      Generic benchmarks miss what matters for India. IndicBench evaluates AI models
                      on tasks that affect a billion people — from IPC legal reasoning to UPI fraud detection,
                      from Ayushman Bharat health queries to NCERT education standards.
                    </p>
                  </motion.div>

                  {/* Indian Use Case Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {INDIAN_USE_CASES.map((useCase, i) => {
                      const Icon = useCase.icon;
                      return (
                        <motion.div
                          key={useCase.category}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: i * 0.08 }}
                          className="glass-card glass-card-hover glass-card-shine p-5 md:p-6 group"
                        >
                          {/* Category badge */}
                          <div
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium mb-3"
                            style={{ backgroundColor: `${useCase.color}12`, color: useCase.color, border: `1px solid ${useCase.color}25` }}
                          >
                            <Icon className="h-3 w-3" />
                            {useCase.category}
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-semibold font-[family-name:var(--font-playfair)] text-[#f5f5f7] mb-2">
                            {useCase.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-[#8b8b9e] leading-relaxed mb-4">
                            {useCase.description}
                          </p>

                          {/* Example tasks */}
                          <div className="space-y-1.5">
                            {useCase.examples.map((example) => (
                              <div key={example} className="flex items-center gap-2 text-[11px] text-[#55556a]">
                                <ArrowRight className="h-3 w-3 shrink-0" style={{ color: useCase.color }} />
                                <span>{example}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom accent */}
                          <div
                            className="mt-4 h-0.5 w-6 rounded-full transition-all duration-300 group-hover:w-10"
                            style={{ backgroundColor: `${useCase.color}40` }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CTA to see benchmarks */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mt-8"
                  >
                    <button
                      onClick={() => setActiveTab("benchmarks")}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-sm font-medium text-[#f59e0b] hover:bg-[rgba(245,158,11,0.15)] transition-all"
                    >
                      Explore All Benchmarks
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* Category Overview Cards */}
              <CategoryCards
                categories={categoriesForCards}
                onCategoryClick={(slug) => {
                  setActiveCategory(slug);
                  setActiveTab("leaderboard");
                }}
                activeCategory={activeCategory}
              />

              {/* Key Differentiators */}
              <DifferentiatorsSection />

              {/* India AI Landscape Cartogram */}
              <IndiaCartogram />

              {/* Model Carousel */}
              <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="mb-3 text-center">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#55556a]">
                    Top Performing Models
                  </span>
                </div>
                <ModelCarousel
                  data={modelsData ?? null}
                  isLoading={modelsLoading}
                  onModelClick={handleModelClick}
                />
              </div>

              {/* Quick Insights - compact */}
              <InsightsSection
                statsData={statsData ?? null}
                modelsData={modelsData ?? null}
              />

              {/* Performance Summary Cards */}
              <PerformanceSummaryCards
                statsData={statsData ?? null}
                modelsData={modelsData ?? null}
                benchmarksData={benchmarksData ?? null}
                isLoading={modelsLoading || benchmarksLoading}
              />

              {/* Institutional badge */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-8 text-center"
              >
                <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3">
                  <Shield className="h-4 w-4 text-[#f59e0b]" />
                  <span className="text-xs text-[#8b8b9e] tracking-wider uppercase">
                    Developed at IIT Gandhinagar for the IndiaAI Mission
                  </span>
                  <Flag className="h-4 w-4 text-[#10b981]" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ===== LEADERBOARD TAB ===== */}
          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="py-6 md:py-8"
            >
              {/* Category filter chips */}
              <div className="container mx-auto px-4 mb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  <span className="text-xs text-[#55556a] uppercase tracking-wider shrink-0">Category:</span>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !activeCategory
                        ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]"
                        : "text-[#8b8b9e] hover:text-[#f5f5f7] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    All
                  </button>
                  {categoriesForCards.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeCategory === cat.slug
                          ? "text-white border"
                          : "text-[#8b8b9e] hover:text-[#f5f5f7] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                      }`}
                      style={activeCategory === cat.slug ? { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}40`, color: cat.color } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard Filters */}
              <div className="container mx-auto px-4 mb-4">
                <LeaderboardFilters
                  data={leaderboardData ?? null}
                  categories={categoriesForCards}
                  onFiltersChange={handleFiltersChange}
                />
              </div>

              {/* Leaderboard Table */}
              <LeaderboardSection
                data={leaderboardData ?? null}
                isLoading={leaderboardLoading}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryClick}
                onModelClick={handleModelClick}
              />

              {/* Model Profile Dialog */}
              <ModelProfileDialog
                modelId={modelProfileId}
                modelName={modelProfileName}
                open={modelProfileOpen}
                onOpenChange={setModelProfileOpen}
              />

              {/* Leaderboard Snapshot */}
              <div className="container mx-auto px-4 mt-6 flex justify-center">
                <LeaderboardSnapshot
                  leaderboardData={leaderboardData ?? null}
                  modelsData={modelsData ?? null}
                  activeCategory={activeCategory}
                />
              </div>

              {/* Performance Heatmap */}
              <div className="mt-6">
                <PerformanceHeatmap
                  modelsData={modelsData ?? null}
                  benchmarksData={benchmarksData ?? null}
                  isLoading={modelsLoading || benchmarksLoading}
                />
              </div>

              {/* Model Comparison Tool */}
              <div className="mt-6">
                <ModelCompare
                  data={modelsData ?? null}
                  isLoading={modelsLoading}
                />
              </div>

              {/* Model Battle */}
              <div className="mt-6">
                <ModelBattle
                  data={modelsData ?? null}
                  isLoading={modelsLoading}
                />
              </div>
            </motion.div>
          )}

          {/* ===== BENCHMARKS TAB ===== */}
          {activeTab === "benchmarks" && (
            <motion.div
              key="benchmarks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="py-6 md:py-8"
            >
              {/* Category Deep Dive */}
              <CategoryDeepDive
                benchmarksData={benchmarksData ?? null}
                modelsData={modelsData ?? null}
                isLoading={benchmarksLoading || modelsLoading}
                defaultCategorySlug={categoriesForCards[0]?.slug}
              />

              {/* Benchmark Explorer */}
              <div className="mt-6">
                <BenchmarkExplorer
                  data={benchmarksData ?? null}
                  isLoading={benchmarksLoading}
                  onBenchmarkClick={handleBenchmarkClick}
                />
              </div>
              <BenchmarkDialog
                slug={dialogSlug}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
              />

              {/* Difficulty Analysis */}
              <div className="mt-6">
                <DifficultyAnalysis
                  benchmarksData={benchmarksData ?? null}
                  isLoading={benchmarksLoading}
                />
              </div>

              {/* Benchmark Timeline */}
              <div className="mt-6">
                <BenchmarkTimeline
                  data={benchmarksData ?? null}
                  isLoading={benchmarksLoading}
                />
              </div>
            </motion.div>
          )}

          {/* ===== ANALYTICS TAB ===== */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="py-6 md:py-8"
            >
              {/* Score Distribution + Donut */}
              <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <ScoreDistribution
                      modelsData={modelsData ?? null}
                      isLoading={modelsLoading}
                    />
                  </div>
                  <CategoryDonutChart categories={categoriesForCards} />
                </div>
              </div>

              {/* Category Ring Chart */}
              <div className="mt-6">
                <CategoryRingChart
                  statsData={statsData ?? null}
                  modelsData={modelsData ?? null}
                />
              </div>

              {/* Domain Radar */}
              <div className="mt-6">
                <DomainRadar
                  modelsData={modelsData ?? null}
                  isLoading={modelsLoading}
                />
              </div>

              {/* Performance Trends */}
              <div className="mt-6">
                <TrendsChart />
              </div>

              {/* Stats Dashboard */}
              <div className="mt-6 container mx-auto px-4">
                <StatsDashboard
                  modelsData={modelsData ?? null}
                  statsData={statsData ?? null}
                />
              </div>

              {/* Cost Analysis */}
              <div className="mt-6">
                <CostAnalysis
                  modelsData={modelsData ?? null}
                  isLoading={modelsLoading}
                />
              </div>
            </motion.div>
          )}

          {/* ===== EVALUATE TAB ===== */}
          {activeTab === "evaluate" && (
            <motion.div
              key="evaluate"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="py-6 md:py-8"
            >
              {/* Run Evaluation */}
              <EvaluateSection
                benchmarksData={benchmarksData ?? null}
                modelsData={modelsData ?? null}
                isLoading={benchmarksLoading || modelsLoading}
                onEvalComplete={handleEvalComplete}
              />

              {/* Score Predictor */}
              <div className="mt-6">
                <ScorePredictor
                  modelsData={modelsData ?? null}
                  benchmarksData={benchmarksData ?? null}
                  isLoading={modelsLoading || benchmarksLoading}
                />
              </div>

              {/* Recent Evaluations Feed */}
              <div className="mt-6">
                <RecentEvaluations
                  leaderboardData={leaderboardData ?? null}
                  benchmarksData={benchmarksData ?? null}
                  isLoading={leaderboardLoading || benchmarksLoading}
                />
              </div>

              {/* Live Evaluation Feed */}
              <div className="mt-6">
                <LiveEvalFeed
                  leaderboardData={leaderboardData ?? null}
                  benchmarksData={benchmarksData ?? null}
                  isLoading={leaderboardLoading || benchmarksLoading}
                />
              </div>

              {/* Evaluation History */}
              <div className="mt-6">
                <EvaluationHistory />
              </div>
            </motion.div>
          )}

          {/* ===== ABOUT TAB ===== */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="py-6 md:py-8"
            >
              {/* About / Methodology */}
              <AboutSection />

              {/* Data Export Center */}
              <div className="mt-6">
                <DataExportCenter
                  leaderboardData={leaderboardData ?? null}
                  benchmarksData={benchmarksData ?? null}
                  modelsData={modelsData ?? null}
                  isLoading={leaderboardLoading || benchmarksLoading || modelsLoading}
                />
              </div>

              {/* Achievement Badges */}
              <div className="mt-6">
                <AchievementBadges />
              </div>

              {/* Contribute a Benchmark */}
              <div className="mt-6">
                <SubmitBenchmark />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Feedback Widget (floating) */}
      <FeedbackWidget />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <IndicBenchApp />
    </QueryClientProvider>
  );
}
