"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/lib/api";

interface CategoryDonutChartProps {
  categories: Category[];
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: "1", slug: "legal", name: "Legal", description: "", icon: "Scale", color: "#f59e0b", order: 1, numBenchmarks: 4 },
  { id: "2", slug: "healthcare", name: "Healthcare", description: "", icon: "HeartPulse", color: "#10b981", order: 2, numBenchmarks: 3 },
  { id: "3", slug: "fintech", name: "Fintech", description: "", icon: "Landmark", color: "#f97316", order: 3, numBenchmarks: 3 },
  { id: "4", slug: "vernacular", name: "Vernacular", description: "", icon: "Languages", color: "#8b5cf6", order: 4, numBenchmarks: 4 },
  { id: "5", slug: "education", name: "Education", description: "", icon: "GraduationCap", color: "#0d9488", order: 5, numBenchmarks: 3 },
];

export function CategoryDonutChart({ categories }: CategoryDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    const cats = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
    const total = cats.reduce((sum, c) => sum + (c.numBenchmarks ?? c.benchmarks?.length ?? 1), 0);
    return cats.map((c) => ({
      name: c.name,
      color: c.color,
      value: c.numBenchmarks ?? c.benchmarks?.length ?? 1,
      percentage: total > 0 ? ((c.numBenchmarks ?? c.benchmarks?.length ?? 1) / total) * 100 : 20,
    }));
  }, [categories]);

  const totalBenchmarks = data.reduce((sum, d) => sum + d.value, 0);

  // SVG donut params
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build arc segments
  const segments = useMemo(() => {
    const gap = 2; // small gap in px equivalent
    return data.reduce<Array<typeof data[number] & { index: number; dashArray: string; dashOffset: number }>>(
      (accArr, d, i) => {
        const prevEnd = i === 0 ? 0 : accArr[i - 1].dashOffset + (data[i - 1].percentage / 100) * circumference;
        const segmentLength = (d.percentage / 100) * circumference - gap;
        accArr.push({
          ...d,
          index: i,
          dashArray: `${Math.max(segmentLength, 0)} ${circumference - Math.max(segmentLength, 0)}`,
          dashOffset: -prevEnd,
        });
        return accArr;
      },
      [],
    );
  }, [data, circumference]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5 md:p-6 flex flex-col items-center"
    >
      <h3 className="text-sm font-medium text-[#8b8b9e] uppercase tracking-wider mb-4">
        Distribution
      </h3>

      {/* Donut SVG */}
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={hoveredIndex === i ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              className="donut-segment"
              style={{ color: seg.color }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.8, delay: i * 0.15, ease: "easeOut" },
                opacity: { duration: 0.3, delay: i * 0.15 },
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-3xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]"
          >
            {totalBenchmarks}
          </motion.span>
          <span className="text-[10px] text-[#55556a] uppercase tracking-widest">
            Benchmarks
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-[220px]">
        {data.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, x: -5 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: d.color,
                boxShadow: hoveredIndex === i ? `0 0 6px ${d.color}` : "none",
              }}
            />
            <span
              className={`text-[11px] transition-colors ${
                hoveredIndex === i ? "text-[#f5f5f7]" : "text-[#8b8b9e]"
              }`}
            >
              {d.name}
            </span>
            <span className="text-[10px] font-[family-name:var(--font-geist-mono)] tabular-nums text-[#55556a] ml-auto">
              {d.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
