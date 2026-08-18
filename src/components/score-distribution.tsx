"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { ModelsResponse } from "@/lib/api";

interface ScoreDistributionProps {
  modelsData: ModelsResponse | null;
  isLoading: boolean;
}

/* Custom dark tooltip */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { range: string; count: number; models: string } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 shadow-xl text-xs">
      <div className="font-medium text-[#f5f5f7] mb-1">{data.range}</div>
      <div className="text-[#8b8b9e]">{data.count} model{data.count !== 1 ? "s" : ""}</div>
      {data.models && <div className="text-[#55556a] mt-1 text-[10px] max-w-[200px] truncate">{data.models}</div>}
    </div>
  );
}

export function ScoreDistribution({ modelsData, isLoading }: ScoreDistributionProps) {
  const distributionData = useMemo(() => {
    if (!modelsData?.models) return [];

    const ranges = [
      { min: 90, max: 100, label: "90-100" },
      { min: 85, max: 90, label: "85-90" },
      { min: 80, max: 85, label: "80-85" },
      { min: 75, max: 80, label: "75-80" },
      { min: 70, max: 75, label: "70-75" },
      { min: 60, max: 70, label: "60-70" },
      { min: 0, max: 60, label: "<60" },
    ];

    return ranges.map(({ min, max, label }) => {
      const matching = modelsData.models.filter(
        (m) => m.overallScore >= min && m.overallScore < max
      );
      return {
        range: label,
        count: matching.length,
        models: matching.map((m) => m.name).join(", "),
      };
    }).filter(d => d.count > 0);
  }, [modelsData]);

  if (isLoading || distributionData.length === 0) return null;

  const barColors = ["#10b981", "#10b981", "#10b981", "#f59e0b", "#f59e0b", "#f97316", "#ef4444"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card !rounded-2xl p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#f59e0b]" />
            Score Distribution
          </h3>
          <p className="text-xs text-[#55556a] mt-0.5">
            How models cluster by overall score
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b]">
          {modelsData?.models.length ?? 0} MODELS
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="range"
            tick={{ fill: "#55556a", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#55556a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {distributionData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColors[index % barColors.length]}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
