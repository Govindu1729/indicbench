"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchTrends, type TrendModel } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

/* ===== Custom Tooltip showing all model scores at a given timepoint ===== */
interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111118]/95 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="text-[10px] uppercase tracking-widest text-[#55556a] mb-2">
        Month: <span className="font-[family-name:var(--font-geist-mono)] text-[#f5f5f7] normal-case">{label}</span>
      </div>
      <div className="space-y-1.5">
        {sorted.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2.5 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}66` }}
            />
            <span className="text-[#8b8b9e] flex-1 truncate">{entry.name}</span>
            <span className="font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
              {(entry.value ?? 0).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Custom Legend with colored dots ===== */
interface LegendPayloadItem {
  value: string;
  color: string;
  dataKey: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  if (!payload || payload.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: item.color, boxShadow: `0 0 8px ${item.color}66` }}
          />
          <span className="text-xs text-[#8b8b9e]">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: fetchTrends,
    staleTime: 5 * 60 * 1000,
  });

  // Build chart data: array of { month: "Mar", "Claude Opus 4": 78.0, ... }
  const chartData = useMemo(() => {
    if (!data) return [];
    const timepoints = data.timepoints;
    const models: TrendModel[] = data.models;
    return timepoints.map((tp, i) => {
      const row: Record<string, string | number> = { month: tp };
      for (const m of models) {
        row[m.name] = m.scores[i] ?? 0;
      }
      return row;
    });
  }, [data]);

  const models = data?.models ?? [];

  if (isLoading) {
    return (
      <section id="trends" className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-56 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="h-72 rounded-xl bg-[rgba(255,255,255,0.03)]" />
        </div>
      </section>
    );
  }

  return (
    <section id="trends" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative mb-2 text-center">
          <SectionNumber number="03" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Performance Trends
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-[#8b8b9e]"
        >
          How top models evolved over the last 6 months
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-4xl"
        >
          <div className="glass-card p-5 md:p-7 relative overflow-hidden">
            {/* Decorative mesh accent blobs */}
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[rgba(245,158,11,0.05)] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-[rgba(96,165,250,0.04)] blur-3xl pointer-events-none" />

            {/* Top row: label + last-6-months badge */}
            <div className="relative z-10 flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#f5f5f7]">Top 5 Models</h3>
                <p className="text-[11px] text-[#55556a] mt-0.5">Overall benchmark score, monthly average</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                Last 6 months
              </span>
            </div>

            {/* Chart */}
            <div className="relative z-10 w-full h-[300px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 4, left: -8 }}
                >
                  <defs>
                    {models.map((m) => (
                      <linearGradient key={m.slug} id={`grad-${m.slug}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={m.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={m.color} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 11, fill: "#8b8b9e" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  />
                  <YAxis
                    domain={[60, 90]}
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 11, fill: "#8b8b9e" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "rgba(245,158,11,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Legend content={<CustomLegend />} />
                  {models.map((m) => (
                    <Line
                      key={m.slug}
                      type="monotone"
                      dataKey={m.name}
                      stroke={m.color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: m.color, stroke: "#0a0a0f", strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: m.color, stroke: "#0a0a0f", strokeWidth: 2 }}
                      isAnimationActive
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
