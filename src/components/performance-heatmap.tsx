"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Grid3X3, Info } from "lucide-react";
import type { ModelsResponse, BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface PerformanceHeatmapProps {
  modelsData: ModelsResponse | null;
  benchmarksData: BenchmarksResponse | null;
  isLoading: boolean;
}

/* Color interpolation: 0→red, 50→yellow, 70→amber, 85→emerald, 100→bright emerald */
function getHeatColor(score: number): string {
  if (score >= 90) return "rgba(16, 185, 129, 0.85)";
  if (score >= 80) return "rgba(16, 185, 129, 0.6)";
  if (score >= 70) return "rgba(245, 158, 11, 0.6)";
  if (score >= 60) return "rgba(249, 115, 22, 0.5)";
  if (score >= 50) return "rgba(239, 68, 68, 0.4)";
  return "rgba(239, 68, 68, 0.6)";
}

function getHeatTextColor(score: number): string {
  if (score >= 80) return "#f5f5f7";
  if (score >= 60) return "#f5f5f7";
  return "#f5f5f7";
}

export function PerformanceHeatmap({ modelsData, benchmarksData, isLoading }: PerformanceHeatmapProps) {
  const { models, benchmarks, matrix } = useMemo(() => {
    if (!modelsData?.models || !benchmarksData?.categories) {
      return { models: [], benchmarks: [], matrix: [] };
    }

    const models = modelsData.models.slice(0, 8); // Top 8 models
    const allBenchmarks: { slug: string; name: string; category: string }[] = [];
    
    for (const cat of benchmarksData.categories) {
      for (const bm of cat.benchmarks) {
        allBenchmarks.push({ slug: bm.slug, name: bm.name, category: cat.name });
      }
    }

    // Build matrix: models × benchmarks → score
    const matrix: number[][] = [];
    for (const model of models) {
      const row: number[] = [];
      for (const bm of allBenchmarks) {
        // Find this model's score on this benchmark
        const catData = benchmarksData.categories.find(c => c.benchmarks.some(b => b.slug === bm.slug));
        const bmData = catData?.benchmarks.find(b => b.slug === bm.slug);
        const ranking = bmData?.modelRankings?.find(r => r.modelName === model.name);
        row.push(ranking?.score ?? 0);
      }
      matrix.push(row);
    }

    return { models, benchmarks: allBenchmarks, matrix };
  }, [modelsData, benchmarksData]);

  if (isLoading) {
    return (
      <section id="heatmap" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="h-64 w-full rounded-xl bg-[rgba(255,255,255,0.03)]" />
        </div>
      </section>
    );
  }

  if (models.length === 0 || benchmarks.length === 0) return null;

  // Truncate benchmark names for display
  const shortName = (name: string, max = 14) => name.length > max ? name.slice(0, max) + "…" : name;

  return (
    <section id="heatmap" className="relative py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-2"
        >
          <span className="section-label">
            <Grid3X3 className="h-3 w-3" />
            Visualization
          </span>
        </motion.div>

        <div className="relative mb-2">
          <SectionNumber number="05" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Performance Heatmap
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-[#8b8b9e]"
        >
          Model scores across all {benchmarks.length} benchmarks — hover for details
        </motion.p>

        {/* Mobile rotation hint */}
        <div className="md:hidden mb-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-xl glass-card px-4 py-2.5 text-xs text-[#8b8b9e]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-60">
              <rect x="1" y="3" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 8h3a1 1 0 011 1v4a1 1 0 01-1 1h-3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Rotate device or use desktop for full heatmap view
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card !rounded-2xl p-4 md:p-6 overflow-x-auto"
        >
          <div className="min-w-[700px]">
            {/* Header row: benchmark names */}
            <div className="flex items-end gap-1 mb-2 pl-[140px]">
              {benchmarks.map((bm, i) => (
                <div
                  key={bm.slug}
                  className="flex-1 min-w-[40px] text-center text-[9px] text-[#55556a] font-medium leading-tight"
                  style={{ transform: "rotate(-45deg)", transformOrigin: "bottom left", whiteSpace: "nowrap" }}
                >
                  {shortName(bm.name, 12)}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {models.map((model, rowIdx) => (
              <div key={model.id} className="flex items-center gap-1 mb-1">
                {/* Model name */}
                <div className="w-[132px] shrink-0 text-right pr-2">
                  <span className="text-xs font-medium text-[#f5f5f7] truncate block">{model.name}</span>
                  <span className="text-[10px] text-[#55556a]">{model.provider}</span>
                </div>

                {/* Cells */}
                {matrix[rowIdx]?.map((score, colIdx) => (
                  <Tooltip key={colIdx}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex-1 min-w-[40px] h-8 rounded-sm flex items-center justify-center cursor-default transition-all hover:scale-110 hover:z-10"
                        style={{ background: score > 0 ? getHeatColor(score) : "rgba(255,255,255,0.03)" }}
                      >
                        {score > 0 && (
                          <span
                            className="text-[10px] font-bold font-[family-name:var(--font-geist-mono)] tabular-nums"
                            style={{ color: getHeatTextColor(score) }}
                          >
                            {score.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-[#111118] border border-[rgba(255,255,255,0.08)] text-[#f5f5f7] text-xs rounded-lg px-3 py-2 shadow-xl"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-[#8b8b9e]">{benchmarks[colIdx]?.name}</div>
                        <div>Score: <span className="font-[family-name:var(--font-geist-mono)] font-bold">{score.toFixed(1)}</span></div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-[#55556a]">
              <span>Score:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: "<50", color: "rgba(239, 68, 68, 0.6)" },
                  { label: "50-60", color: "rgba(239, 68, 68, 0.4)" },
                  { label: "60-70", color: "rgba(249, 115, 22, 0.5)" },
                  { label: "70-80", color: "rgba(245, 158, 11, 0.6)" },
                  { label: "80-90", color: "rgba(16, 185, 129, 0.6)" },
                  { label: "90+", color: "rgba(16, 185, 129, 0.85)" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
