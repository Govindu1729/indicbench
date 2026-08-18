"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Zap,
  DollarSign,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Activity,
  Share2,
  CheckCircle2,
  Crown,
  Star,
  Shield,
  Circle,
  Table2,
  Layers,
  Eye,
} from "lucide-react";
import { fetchModels, fetchBenchmarks } from "@/lib/api";
import type { ModelsResponse, BenchmarksResponse } from "@/lib/api";
import { ModelRadarChart } from "@/components/model-radar-chart";

/* ===== Score Gauge (SVG Arc) ===== */
function ScoreGauge({ score, size = 40, strokeWidth = 3 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const classMap: Record<string, string> = {
    OpenAI: "provider-openai",
    Anthropic: "provider-anthropic",
    Google: "provider-google",
    Meta: "provider-meta",
    Mistral: "provider-mistral",
  };
  const cls = classMap[provider] || "provider-default";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {provider}
    </span>
  );
}

/* ===== Tier Badge ===== */
function TierBadge({ score }: { score: number }) {
  const tier = score >= 85 ? "S" : score >= 75 ? "A" : score >= 65 ? "B" : "C";
  const config = {
    S: { icon: Crown, color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", label: "Elite" },
    A: { icon: Star, color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", label: "Strong" },
    B: { icon: Shield, color: "#d97706", bg: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.3)", label: "Capable" },
    C: { icon: Circle, color: "#8b8b9e", bg: "rgba(139,139,158,0.08)", border: "rgba(139,139,158,0.2)", label: "Developing" },
  }[tier];
  const Icon = config.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}
      title={`${config.label} tier`}
    >
      <Icon className="h-2.5 w-2.5" />
      {tier} — {config.label}
    </span>
  );
}

/* ===== Large Score Gauge with Label ===== */
function LargeScoreGauge({ score, label }: { score: number; label?: string }) {
  const size = 80;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
          {score.toFixed(0)}
        </span>
      </div>
      {label && <span className="text-[10px] text-[#55556a] uppercase tracking-wider mt-1">{label}</span>}
    </div>
  );
}

interface ModelProfileDialogProps {
  modelId: string | null;
  modelName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelProfileDialog({ modelId, modelName, open, onOpenChange }: ModelProfileDialogProps) {
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });

  const { data: benchmarksData } = useQuery({
    queryKey: ["benchmarks"],
    queryFn: fetchBenchmarks,
  });

  const [compareModelId, setCompareModelId] = useState<string>("");
  const [shareCopied, setShareCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Find the model
  const model = modelId && modelsData
    ? modelsData.models.find((m) => m.id === modelId)
    : null;

  const compareModel = compareModelId && modelsData
    ? modelsData.models.find((m) => m.id === compareModelId)
    : null;

  const handleShare = useCallback(() => {
    if (!model) return;
    const url = `${window.location.origin}?model=${encodeURIComponent(model.slug)}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [model]);

  // Build benchmark details data from benchmarksData
  const benchmarkDetails = useMemo(() => {
    if (!benchmarksData || !model) return [];
    const details: { benchmarkName: string; categoryName: string; score: number; accuracy: number | null; latencyMs: number | null }[] = [];
    for (const cat of benchmarksData.categories) {
      for (const bm of cat.benchmarks) {
        const ranking = bm.modelRankings?.find((r) => r.modelId === model.id);
        if (ranking) {
          details.push({
            benchmarkName: bm.name,
            categoryName: cat.name,
            score: ranking.score,
            accuracy: ranking.accuracy,
            latencyMs: ranking.latencyMs,
          });
        }
      }
    }
    return details.sort((a, b) => b.score - a.score);
  }, [benchmarksData, model]);

  if (!model) return null;

  const categoryEntries = Object.entries(model.categoryScores || {})
    .filter(([, v]) => v != null)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const categoryNameMap: Record<string, string> = {
    legal: "Legal Reasoning",
    healthcare: "Healthcare AI",
    fintech: "Fintech & BFSI",
    vernacular: "Vernacular AI",
    education: "Education & Skilling",
  };

  const categoryColorMap: Record<string, string> = {
    legal: "#f59e0b",
    healthcare: "#10b981",
    fintech: "#60a5fa",
    vernacular: "#a78bfa",
    education: "#f97316",
  };

  // Filter out current model from comparison list
  const otherModels = modelsData?.models.filter((m) => m.id !== modelId) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark-dialog-content max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-[family-name:var(--font-playfair)] text-xl">
            <div className="relative">
              <ScoreGauge score={model.overallScore} size={48} strokeWidth={3} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]">
                {model.overallScore.toFixed(0)}
              </span>
            </div>
            <div>
              <div className="gradient-text-saffron">{model.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <ProviderBadge provider={model.provider} />
                <TierBadge score={model.overallScore} />
                {model.version && (
                  <span className="text-xs text-[#55556a]">{model.version}</span>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-[#8b8b9e]">
            Detailed performance profile across all benchmark categories
          </DialogDescription>
        </DialogHeader>

        {/* Quick Compare + Share */}
        <div className="flex items-center gap-3 flex-wrap mt-1">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-xs text-[#8b8b9e] shrink-0">Compare with:</span>
            <Select value={compareModelId} onValueChange={setCompareModelId}>
              <SelectTrigger className="h-8 text-xs bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#f5f5f7] w-full">
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent className="dark-dialog-content">
                {otherModels.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#8b8b9e] hover:text-[#f5f5f7] transition-all shrink-0"
          >
            {shareCopied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                <span className="text-[#10b981]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                Share Model
              </>
            )}
          </button>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg w-full">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-[rgba(245,158,11,0.1)] data-[state=active]:text-[#f59e0b]">
              <Eye className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs data-[state=active]:bg-[rgba(245,158,11,0.1)] data-[state=active]:text-[#f59e0b]">
              <Layers className="h-3 w-3" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="text-xs data-[state=active]:bg-[rgba(245,158,11,0.1)] data-[state=active]:text-[#f59e0b]">
              <Table2 className="h-3 w-3" />
              Benchmarks
            </TabsTrigger>
          </TabsList>

          {/* ===== Overview Tab ===== */}
          <TabsContent value="overview" className="space-y-5 mt-4">
            {/* Radar Chart */}
            <div className="flex flex-col items-center">
              <ModelRadarChart
                modelName={model.name}
                scores={model.categoryScores || {}}
                comparisonModel={
                  compareModel
                    ? { name: compareModel.name, scores: compareModel.categoryScores || {} }
                    : undefined
                }
                size={240}
              />
            </div>

            {/* Overall Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Trophy, label: "Rank", value: `#${model.rank}`, color: model.rank <= 3 ? "#fbbf24" : "#8b8b9e" },
                { icon: Target, label: "Score", value: model.overallScore.toFixed(1), color: "#10b981" },
                { icon: Clock, label: "Avg Latency", value: model.avgLatencyMs ? `${model.avgLatencyMs.toFixed(0)}ms` : "—", color: "#60a5fa" },
                { icon: DollarSign, label: "Avg Cost", value: model.avgCostUsd ? `$${model.avgCostUsd.toFixed(4)}` : "—", color: "#a78bfa" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card p-3 flex flex-col items-center text-center"
                  >
                    <Icon className="h-4 w-4 mb-1" style={{ color: stat.color }} />
                    <div className="text-lg font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-[#55556a] uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Score Gauges Row */}
            <div className="flex items-center justify-center gap-6">
              <LargeScoreGauge score={model.overallScore} label="Overall" />
              {categoryEntries.slice(0, 2).map(([key, value]) => (
                <LargeScoreGauge key={key} score={value as number} label={categoryNameMap[key] || key} />
              ))}
            </div>

            {/* Performance Summary */}
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold text-[#f5f5f7] mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#10b981]" />
                Performance Summary
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[#10b981]" />
                  <span className="text-[#8b8b9e]">Strongest:</span>
                  <span className="text-[#f5f5f7] font-medium">
                    {categoryEntries.length > 0 ? categoryNameMap[categoryEntries[0][0]] || categoryEntries[0][0] : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#f97316]" />
                  <span className="text-[#8b8b9e]">Weakest:</span>
                  <span className="text-[#f5f5f7] font-medium">
                    {categoryEntries.length > 0 ? categoryNameMap[categoryEntries[categoryEntries.length - 1][0]] || categoryEntries[categoryEntries.length - 1][0] : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 inline-flex items-center justify-center text-[#8b8b9e] text-xs font-bold">σ</span>
                  <span className="text-[#8b8b9e]">Consistency:</span>
                  <span className="text-[#f5f5f7] font-medium">
                    {(() => {
                      const scoreVals = categoryEntries.map(([, v]) => v as number);
                      const mean = scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length;
                      const variance = scoreVals.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scoreVals.length;
                      const std = Math.sqrt(variance);
                      return std < 5 ? "Excellent" : std < 10 ? "Good" : std < 15 ? "Moderate" : "Variable";
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[rgba(255,255,255,0.1)]">
                    {model.rank <= 3 ? "Top 3" : model.rank <= 5 ? "Top 5" : "Ranked"}
                  </Badge>
                  <span className="text-[#8b8b9e]">Overall position</span>
                </div>
              </div>
            </div>

            {/* Latency and Cost Detail */}
            {(model.avgLatencyMs || model.avgCostUsd) && (
              <div className="glass-card p-4">
                <h4 className="text-sm font-semibold text-[#f5f5f7] mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#60a5fa]" />
                  Latency &amp; Cost
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {model.avgLatencyMs && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#60a5fa]" />
                      <span className="text-[#8b8b9e]">Avg Latency:</span>
                      <span className="text-[#f5f5f7] font-medium font-[family-name:var(--font-geist-mono)] tabular-nums">
                        {model.avgLatencyMs.toFixed(0)}ms
                      </span>
                    </div>
                  )}
                  {model.avgCostUsd && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-[#a78bfa]" />
                      <span className="text-[#8b8b9e]">Avg Cost:</span>
                      <span className="text-[#f5f5f7] font-medium font-[family-name:var(--font-geist-mono)] tabular-nums">
                        ${model.avgCostUsd.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ===== Category Breakdown Tab ===== */}
          <TabsContent value="categories" className="space-y-5 mt-4">
            {/* Horizontal Bar Chart */}
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold text-[#f5f5f7] mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#f59e0b]" />
                Score per Category
              </h4>
              <div className="space-y-4">
                {categoryEntries.map(([key, value], i) => {
                  const score = value as number;
                  const color = categoryColorMap[key] || "#8b8b9e";
                  const compareScore = compareModel?.categoryScores?.[key];
                  const diff = compareScore != null ? score - compareScore : null;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#f5f5f7]">{categoryNameMap[key] || key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color }}>
                            {score.toFixed(1)}
                          </span>
                          {diff != null && (
                            <span className={`text-[10px] font-[family-name:var(--font-geist-mono)] tabular-nums ${diff > 0 ? "text-[#10b981]" : diff < 0 ? "text-[#ef4444]" : "text-[#55556a]"}`}>
                              {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="h-6 rounded-lg bg-[rgba(255,255,255,0.04)] overflow-hidden relative">
                        {compareScore != null && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${compareScore}%` }}
                            transition={{ duration: 0.7, delay: i * 0.06 }}
                            className="absolute top-0 left-0 h-full rounded-lg bg-[rgba(139,92,246,0.2)]"
                          />
                        )}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06 }}
                          className="h-full rounded-lg relative z-10 flex items-center justify-end pr-2"
                          style={{ background: `linear-gradient(90deg, ${color}44, ${color}aa)` }}
                        >
                          <span className="text-[9px] font-[family-name:var(--font-geist-mono)] text-white/80">{score.toFixed(0)}%</span>
                        </motion.div>
                      </div>
                      {compareScore != null && (
                        <div className="flex items-center justify-between text-[10px] text-[#55556a]">
                          <span>{compareModel?.name}: {compareScore.toFixed(1)}</span>
                          <span className="text-[#8b5cf6]">{compareScore.toFixed(0)}%</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Comparison legend */}
            {compareModel && (
              <div className="flex items-center justify-center gap-4 text-[10px] text-[#8b8b9e]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981]" />
                  <span>{model.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-[rgba(139,92,246,0.4)]" />
                  <span>{compareModel.name}</span>
                </div>
              </div>
            )}

            {/* Mini gauges grid */}
            <div className="grid grid-cols-5 gap-2">
              {categoryEntries.map(([key, value]) => (
                <div key={key} className="glass-card p-2 flex flex-col items-center text-center">
                  <ScoreGauge score={value as number} size={32} strokeWidth={2.5} />
                  <span className="text-[9px] text-[#8b8b9e] mt-1 leading-tight">{categoryNameMap[key] || key}</span>
                  <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color: categoryColorMap[key] || "#8b8b9e" }}>
                    {(value as number).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ===== Benchmark Details Tab ===== */}
          <TabsContent value="benchmarks" className="space-y-4 mt-4">
            {benchmarkDetails.length === 0 ? (
              <div className="glass-card p-6 text-center text-sm text-[#55556a]">
                No benchmark results found for this model.
              </div>
            ) : (
              <>
                {/* Summary row */}
                <div className="flex items-center gap-4 text-xs text-[#8b8b9e]">
                  <span>{benchmarkDetails.length} benchmarks evaluated</span>
                  <span>Avg score: <span className="font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]">{(benchmarkDetails.reduce((sum, d) => sum + d.score, 0) / benchmarkDetails.length).toFixed(1)}</span></span>
                  <span>Best: <span className="font-[family-name:var(--font-geist-mono)] text-[#10b981]">{benchmarkDetails[0]?.score.toFixed(1)}</span></span>
                  <span>Worst: <span className="font-[family-name:var(--font-geist-mono)] text-[#ef4444]">{benchmarkDetails[benchmarkDetails.length - 1]?.score.toFixed(1)}</span></span>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden !rounded-xl">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[10px] font-medium text-[#55556a] uppercase tracking-wider">
                    <div className="flex-1 min-w-[120px]">Benchmark</div>
                    <div className="w-20 hidden sm:block">Category</div>
                    <div className="w-14 text-right">Score</div>
                    <div className="w-16 text-right hidden sm:block">Accuracy</div>
                    <div className="w-20 text-right hidden md:block">Latency</div>
                    <div className="w-8" />
                  </div>
                  {/* Rows */}
                  <div className="max-h-[320px] overflow-y-auto">
                    {benchmarkDetails.map((detail, i) => {
                      const scoreColor = detail.score >= 80 ? "#10b981" : detail.score >= 60 ? "#f59e0b" : detail.score >= 40 ? "#f97316" : "#ef4444";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.03 }}
                          className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                        >
                          <div className="flex-1 min-w-[120px] text-xs font-medium text-[#f5f5f7] truncate">{detail.benchmarkName}</div>
                          <div className="w-20 hidden sm:block text-[10px] text-[#8b8b9e] truncate">{detail.categoryName}</div>
                          <div className="w-14 text-right text-xs font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color: scoreColor }}>
                            {detail.score.toFixed(1)}
                          </div>
                          <div className="w-16 text-right text-xs text-[#8b8b9e] font-[family-name:var(--font-geist-mono)] tabular-nums hidden sm:block">
                            {detail.accuracy != null ? `${(detail.accuracy * 100).toFixed(0)}%` : "—"}
                          </div>
                          <div className="w-20 text-right text-xs text-[#8b8b9e] font-[family-name:var(--font-geist-mono)] tabular-nums hidden md:block">
                            {detail.latencyMs != null ? `${detail.latencyMs.toFixed(0)}ms` : "—"}
                          </div>
                          <div className="w-8">
                            <ScoreGauge score={detail.score} size={20} strokeWidth={2} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
