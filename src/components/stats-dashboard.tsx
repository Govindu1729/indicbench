"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ModelsResponse, StatsResponse } from "@/lib/api";

interface StatsDashboardProps {
  modelsData: ModelsResponse | null;
  statsData: StatsResponse | null;
}

interface SparklineData {
  label: string;
  values: number[];
  color: string;
  suffix: string;
}

export function StatsDashboard({ modelsData, statsData }: StatsDashboardProps) {
  // Derive sparkline data from modelsData
  const sparklines: SparklineData[] = useMemo(() => {
    const models = modelsData?.models ?? [];
    if (models.length === 0) return [];

    // Sort by overallScore descending
    const sorted = [...models].sort((a, b) => b.overallScore - a.overallScore);

    // 1. Accuracy Trend — top 8 models' overall scores
    const accuracyTrend = sorted.slice(0, 8).map((m) => m.overallScore);

    // 2. Latency Trend — top 8 models' avg latency (normalized to 0-100 scale)
    const latencyTrend = sorted
      .slice(0, 8)
      .map((m) => Math.max(0, 100 - (m.avgLatencyMs ?? 2000) / 30));

    // 3. Cost Trend — top 8 models' cost (lower is better, inverted)
    const costTrend = sorted
      .slice(0, 8)
      .map((m) => Math.max(0, 100 - (m.avgCostUsd ?? 0.5) * 150));

    // 4. Score Distribution — histogram buckets
    const buckets = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
    for (const m of models) {
      const idx = Math.min(4, Math.floor(m.overallScore / 20));
      buckets[idx]++;
    }
    const maxBucket = Math.max(...buckets, 1);
    const scoreDist = buckets.map((b) => (b / maxBucket) * 100);

    return [
      {
        label: "Accuracy Trend",
        values: accuracyTrend,
        color: "#f59e0b",
        suffix: "%",
      },
      {
        label: "Latency Trend",
        values: latencyTrend,
        color: "#10b981",
        suffix: "",
      },
      {
        label: "Cost Efficiency",
        values: costTrend,
        color: "#60a5fa",
        suffix: "",
      },
      {
        label: "Score Distribution",
        values: scoreDist,
        color: "#a78bfa",
        suffix: "",
      },
    ];
  }, [modelsData]);

  if (sparklines.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card p-4 h-24 rounded-xl bg-[rgba(255,255,255,0.03)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {sparklines.map((spark, idx) => (
        <motion.div
          key={spark.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="glass-card glass-card-shine p-4 relative overflow-hidden"
        >
          {/* Accent glow */}
          <div
            className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: `${spark.color}15` }}
          />

          <div className="relative z-10">
            {/* Label */}
            <div className="text-[10px] text-[#55556a] uppercase tracking-wider mb-2">
              {spark.label}
            </div>

            {/* Sparkline SVG */}
            <svg
              viewBox="0 0 100 30"
              className="w-full h-8"
              preserveAspectRatio="none"
            >
              {/* Area fill */}
              {spark.values.length > 1 && (
                <polygon
                  className="sparkline-area"
                  fill={spark.color}
                  points={(() => {
                    const step = 100 / (spark.values.length - 1);
                    const pts = spark.values.map((v, i) => {
                      const x = i * step;
                      const y = 30 - (v / 100) * 28 - 1;
                      return `${x},${y}`;
                    });
                    return `${pts.join(" ")} 100,30 0,30`;
                  })()}
                />
              )}
              {/* Line */}
              {spark.values.length > 1 && (
                <polyline
                  fill="none"
                  stroke={spark.color}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={(() => {
                    const step = 100 / (spark.values.length - 1);
                    return spark.values
                      .map((v, i) => {
                        const x = i * step;
                        const y = 30 - (v / 100) * 28 - 1;
                        return `${x},${y}`;
                      })
                      .join(" ");
                  })()}
                />
              )}
              {/* End dot */}
              {spark.values.length > 0 && (
                <circle
                  cx={100}
                  cy={30 - (spark.values[spark.values.length - 1] / 100) * 28 - 1}
                  r="2"
                  fill={spark.color}
                />
              )}
            </svg>

            {/* Current value */}
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className="text-lg font-bold font-[family-name:var(--font-geist-mono)] tabular-nums"
                style={{ color: spark.color }}
              >
                {spark.values.length > 0
                  ? spark.values[spark.values.length - 1].toFixed(1)
                  : "—"}
              </span>
              {spark.suffix && (
                <span className="text-[10px] text-[#55556a]">
                  {spark.suffix}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
