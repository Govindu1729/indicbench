"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ModelsResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";
import { ScoreGauge, ProviderBadge } from "@/components/shared-ui";

interface ModelCompareProps {
  data: ModelsResponse | null;
  isLoading: boolean;
}

const CATEGORY_KEYS = ["legal", "healthcare", "fintech", "vernacular", "education"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  legal: "Legal",
  healthcare: "Healthcare",
  fintech: "Fintech",
  vernacular: "Vernacular",
  education: "Education",
};



export function ModelCompare({ data, isLoading }: ModelCompareProps) {
  const [modelAId, setModelAId] = useState<string>("");
  const [modelBId, setModelBId] = useState<string>("");

  const models = useMemo(() => data?.models ?? [], [data]);

  const modelA = useMemo(() => models.find((m) => m.id === modelAId) ?? null, [models, modelAId]);
  const modelB = useMemo(() => models.find((m) => m.id === modelBId) ?? null, [models, modelBId]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!modelA && !modelB) return [];
    return CATEGORY_KEYS.map((key) => ({
      category: CATEGORY_LABELS[key],
      modelA: modelA?.categoryScores?.[key] ?? 0,
      modelB: modelB?.categoryScores?.[key] ?? 0,
    }));
  }, [modelA, modelB]);

  // Category bar comparisons
  const categoryBars = useMemo(() => {
    if (!modelA && !modelB) return [];
    return CATEGORY_KEYS.map((key) => ({
      key,
      label: CATEGORY_LABELS[key],
      scoreA: modelA?.categoryScores?.[key] ?? 0,
      scoreB: modelB?.categoryScores?.[key] ?? 0,
    }));
  }, [modelA, modelB]);

  const modelAName = modelA?.name ?? "Model A";
  const modelBName = modelB?.name ?? "Model B";

  if (isLoading) {
    return (
      <section id="compare" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-56 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="h-12 rounded-xl bg-[rgba(255,255,255,0.03)]" />
            <div className="h-12 rounded-xl bg-[rgba(255,255,255,0.03)]" />
          </div>
          <div className="h-64 rounded-xl bg-[rgba(255,255,255,0.03)]" />
        </div>
      </section>
    );
  }

  return (
    <section id="compare" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section title */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="06" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Compare Models
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Side-by-side performance analysis across all domains
        </motion.p>

        {/* Model Selectors */}
        <div className="grid md:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">
          <div>
            <label className="block text-xs text-[#8b8b9e] uppercase tracking-wider mb-2">Model A</label>
            <Select value={modelAId} onValueChange={setModelAId}>
              <SelectTrigger className="w-full dark-select-trigger !rounded-xl !h-11">
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent className="dark-select-content">
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-[#8b8b9e] uppercase tracking-wider mb-2">Model B</label>
            <Select value={modelBId} onValueChange={setModelBId}>
              <SelectTrigger className="w-full dark-select-trigger !rounded-xl !h-11">
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent className="dark-select-content">
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Empty state prompts */}
        {!modelA && !modelB && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center"
          >
            <div className="text-4xl mb-3">&#x1F504;</div>
            <p className="text-[#8b8b9e]">Select two models above to compare their performance</p>
          </motion.div>
        )}

        {(modelA || modelB) && (!modelA || !modelB) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center"
          >
            <div className="text-4xl mb-3">&#x1F4CA;</div>
            <p className="text-[#8b8b9e]">
              Select {modelA ? "another" : "a"} model to see the comparison
            </p>
          </motion.div>
        )}

        {/* Full comparison */}
        {modelA && modelB && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats comparison row */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[modelA, modelB].map((model, idx) => (
                <div key={model.id} className="glass-card p-5 flex items-center gap-4">
                  <ScoreGauge score={model.overallScore} size={56} strokeWidth={4} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#f5f5f7] truncate">{model.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <ProviderBadge provider={model.provider} />
                      <span className="text-xs text-[#8b8b9e]">Rank #{model.rank}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
                      {model.overallScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-[#55556a] uppercase tracking-wider">Overall</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart */}
            <div className="glass-card p-6 mb-8">
              <h3 className="text-sm font-medium text-[#8b8b9e] uppercase tracking-wider mb-4">
                Category Radar
              </h3>
              <div className="w-full h-[320px] md:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: "#8b8b9e", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "#55556a", fontSize: 10 }}
                      tickCount={5}
                    />
                    <Radar
                      name={modelAName}
                      dataKey="modelA"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Radar
                      name={modelBName}
                      dataKey="modelB"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ color: "#8b8b9e", fontSize: 12 }}
                      formatter={(value: string) => (
                        <span style={{ color: "#8b8b9e", fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category-by-category bar comparison */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-[#8b8b9e] uppercase tracking-wider mb-5">
                Category Breakdown
              </h3>
              <div className="space-y-4">
                {categoryBars.map((cat) => {
                  const maxScore = Math.max(cat.scoreA, cat.scoreB, 1);
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#f5f5f7]">{cat.label}</span>
                      </div>
                      {/* Model A bar */}
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[10px] text-[#f59e0b] w-3 shrink-0 font-bold">A</span>
                        <div className="flex-1 h-6 rounded-md bg-[rgba(255,255,255,0.04)] overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.scoreA / 100) * 100}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-md bg-gradient-to-r from-[rgba(245,158,11,0.3)] to-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)]"
                          />
                        </div>
                        <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7] w-10 text-right">
                          {cat.scoreA.toFixed(1)}
                        </span>
                      </div>
                      {/* Model B bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#10b981] w-3 shrink-0 font-bold">B</span>
                        <div className="flex-1 h-6 rounded-md bg-[rgba(255,255,255,0.04)] overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.scoreB / 100) * 100}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-md bg-gradient-to-r from-[rgba(16,185,129,0.3)] to-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)]"
                          />
                        </div>
                        <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7] w-10 text-right">
                          {cat.scoreB.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend for bars */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[rgba(245,158,11,0.3)] border border-[rgba(245,158,11,0.5)]" />
                  <span className="text-xs text-[#8b8b9e] truncate max-w-[160px]">{modelAName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[rgba(16,185,129,0.3)] border border-[rgba(16,185,129,0.5)]" />
                  <span className="text-xs text-[#8b8b9e] truncate max-w-[160px]">{modelBName}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
