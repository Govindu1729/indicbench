"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchBenchmarkDetail } from "@/lib/api";
import type { ModelRanking } from "@/lib/api";

interface BenchmarkDialogProps {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAFFRON = "#f59e0b";
const EMERALD = "#10b981";
const AMBER = "#fbbf24";
const TEAL = "#0d9488";
const ORANGE = "#f97316";

const MODEL_COLORS = [SAFFRON, EMERALD, AMBER, TEAL, ORANGE, "#d97706", "#059669", "#ca8a04", "#0f766e", "#ea580c"];

function ScoreGauge({ score, size = 36, strokeWidth = 2.5 }: { score: number; size?: number; strokeWidth?: number }) {
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
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {provider}
    </span>
  );
}

export function BenchmarkDialog({ slug, open, onOpenChange }: BenchmarkDialogProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["benchmark-detail", slug],
    queryFn: () => fetchBenchmarkDetail(slug!),
    enabled: !!slug && open,
  });

  const barData = (data?.modelResults ?? []).map((r) => ({
    name: r.modelName.length > 12 ? r.modelName.slice(0, 12) + "…" : r.modelName,
    score: r.score,
    fill: MODEL_COLORS[(r.rank - 1) % MODEL_COLORS.length],
  }));

  const scatterData = (data?.modelResults ?? [])
    .filter((r) => r.costUsd != null)
    .map((r) => ({
      name: r.modelName,
      score: r.score,
      cost: (r.costUsd ?? 0) * 1000,
    }));

  const chartConfig = {
    score: { label: "Score", color: SAFFRON },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto dark-dialog-content [&>button]:text-[#8b8b9e] [&>button:hover]:text-[#f5f5f7] [&>button:focus]:ring-[#f59e0b]">
        {isLoading && (
          <>
            <DialogHeader>
              <DialogTitle>
                <div className="h-6 w-48 rounded bg-[rgba(255,255,255,0.06)]" />
              </DialogTitle>
              <DialogDescription>
                <div className="h-4 w-64 rounded bg-[rgba(255,255,255,0.04)]" />
              </DialogDescription>
            </DialogHeader>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full mb-2 rounded bg-[rgba(255,255,255,0.03)]" />
            ))}
          </>
        )}

        {error && !isLoading && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f7]">Error</DialogTitle>
              <DialogDescription className="text-[#8b8b9e]">
                {error instanceof Error ? error.message : "Failed to load benchmark details"}
              </DialogDescription>
            </DialogHeader>
          </>
        )}

        {data && !isLoading && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f7] font-[family-name:var(--font-playfair)] text-xl">{data.benchmark.name}</DialogTitle>
              <DialogDescription className="text-[#8b8b9e]">
                {data.benchmark.description} — {data.benchmark.numQuestions} questions •{" "}
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">
                  {data.benchmark.difficulty}
                </span>{" "}
                • {data.totalModels} models evaluated
              </DialogDescription>
            </DialogHeader>

            {/* Ranking Table with glass styling */}
            <div className="glass-card overflow-hidden !rounded-xl mt-4">
              {/* Table header */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                <div className="w-8 text-[10px] font-medium text-[#55556a] uppercase tracking-wider">#</div>
                <div className="flex-1 min-w-[120px] text-[10px] font-medium text-[#55556a] uppercase tracking-wider">Model</div>
                <div className="w-24 text-[10px] font-medium text-[#55556a] uppercase tracking-wider">Score</div>
                <div className="hidden md:block w-14 text-[10px] font-medium text-[#55556a] uppercase tracking-wider text-right">Acc</div>
                <div className="hidden md:block w-14 text-[10px] font-medium text-[#55556a] uppercase tracking-wider text-right">F1</div>
                <div className="hidden lg:block w-16 text-[10px] font-medium text-[#55556a] uppercase tracking-wider text-right">Latency</div>
                <div className="hidden lg:block w-16 text-[10px] font-medium text-[#55556a] uppercase tracking-wider text-right">Cost</div>
              </div>
              {/* Table body */}
              {data.modelResults.map((r: ModelRanking) => {
                const isTop3 = r.rank <= 3;
                const rowClass = isTop3
                  ? r.rank === 1 ? "glass-row-top-1" : r.rank === 2 ? "glass-row-top-2" : "glass-row-top-3"
                  : "";
                return (
                  <div
                    key={r.modelId}
                    className={`flex items-center gap-3 px-4 py-2.5 glass-row ${rowClass} hover:bg-[rgba(255,255,255,0.04)] transition-colors`}
                  >
                    <div className="w-8 text-center text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#8b8b9e]">{r.rank}</div>
                    <div className="flex-1 min-w-[120px]">
                      <div className="text-sm font-medium text-[#f5f5f7] mb-0.5">{r.modelName}</div>
                      <ProviderBadge provider={r.provider} />
                    </div>
                    <div className="w-24 flex items-center gap-2">
                      <ScoreGauge score={r.score} size={28} strokeWidth={2} />
                      <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">{r.score.toFixed(1)}</span>
                    </div>
                    <div className="hidden md:block w-14 text-right text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#8b8b9e]">
                      {r.accuracy != null ? r.accuracy.toFixed(1) + "%" : "—"}
                    </div>
                    <div className="hidden md:block w-14 text-right text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#8b8b9e]">
                      {r.f1Score != null ? r.f1Score.toFixed(3) : "—"}
                    </div>
                    <div className="hidden lg:block w-16 text-right text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#55556a]">
                      {r.latencyMs != null ? `${r.latencyMs.toFixed(0)}ms` : "—"}
                    </div>
                    <div className="hidden lg:block w-16 text-right text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#55556a]">
                      {r.costUsd != null ? `$${r.costUsd.toFixed(4)}` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bar Chart — Model Scores */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-[#f5f5f7]">Model Score Comparison</h4>
              <ChartContainer config={chartConfig} className="h-[250px] w-full" style={{ aspectRatio: undefined }}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#55556a" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fontSize: 10, fill: "#8b8b9e" }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}`, "Score"]}
                    contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f7" }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            {/* Scatter — Cost vs Score */}
            {scatterData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2 text-[#f5f5f7]">Cost vs. Score</h4>
                <ChartContainer config={chartConfig} className="h-[200px] w-full" style={{ aspectRatio: undefined }}>
                  <ScatterChart margin={{ left: 10, right: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      dataKey="cost"
                      name="Cost per 1K tokens"
                      tick={{ fontSize: 10, fill: "#55556a" }}
                      label={{ value: "Cost ($/1K)", position: "bottom", fontSize: 10, offset: 0, fill: "#55556a" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="score"
                      name="Score"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#55556a" }}
                    />
                    <ZAxis range={[60, 200]} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "score" ? value.toFixed(1) : `$${value.toFixed(3)}`,
                        name === "score" ? "Score" : "Cost/1K",
                      ]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.name ?? ""
                      }
                      contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f7" }}
                    />
                    <Scatter data={scatterData} fill={SAFFRON}>
                      {scatterData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={MODEL_COLORS[index % MODEL_COLORS.length]}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ChartContainer>
              </div>
            )}
          </>
        )}

        {!data && !isLoading && !error && (
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f7]">Select a Benchmark</DialogTitle>
            <DialogDescription className="text-[#8b8b9e]">Click any benchmark card to view detailed results.</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}
