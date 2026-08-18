"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { StatsResponse, ModelsResponse } from "@/lib/api";

interface CategoryRingChartProps {
  statsData: StatsResponse | null;
  modelsData: ModelsResponse | null;
}

interface RingData {
  name: string;
  slug: string;
  score: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  legal: "#f59e0b",
  healthcare: "#10b981",
  fintech: "#60a5fa",
  vernacular: "#a78bfa",
  education: "#f97316",
};

export function CategoryRingChart({ statsData, modelsData }: CategoryRingChartProps) {
  const [hoveredRing, setHoveredRing] = useState<string | null>(null);

  // Build ring data from modelsData categories
  const rings: RingData[] = useMemo(() => {
    const categories = statsData?.categories ?? modelsData?.categories ?? [];
    const models = modelsData?.models ?? [];

    return categories.map((cat) => {
      // Average score across all models for this category
      const scores = models
        .map((m) => m.categoryScores?.[cat.slug])
        .filter((s): s is number => s != null);
      const avgScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

      return {
        name: cat.name,
        slug: cat.slug,
        score: Math.round(avgScore * 10) / 10,
        color: CATEGORY_COLORS[cat.slug] ?? cat.color ?? "#8b8b9e",
      };
    });
  }, [statsData, modelsData]);

  // Overall average
  const overallAvg = useMemo(() => {
    if (rings.length === 0) return 0;
    return Math.round((rings.reduce((sum, r) => sum + r.score, 0) / rings.length) * 10) / 10;
  }, [rings]);

  // SVG sizing
  const size = 260;
  const center = size / 2;
  const ringWidth = 10;
  const ringGap = 5;

  // Build SVG ring paths
  const ringElements = useMemo(() => {
    return rings.map((ring, idx) => {
      const radius = center - (idx + 1) * (ringWidth + ringGap) - 4;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (ring.score / 100) * circumference;
      const isHovered = hoveredRing === ring.slug;

      return {
        ...ring,
        radius,
        circumference,
        offset,
        isHovered,
        idx,
      };
    });
  }, [rings, center, ringWidth, ringGap, hoveredRing]);

  if (rings.length === 0) {
    return (
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md h-64 rounded-xl bg-[rgba(255,255,255,0.03)]" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative mb-2 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Category Performance
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Average scores across all models by domain
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-3xl"
        >
          <div className="glass-card glass-card-shine p-6 md:p-8 relative overflow-hidden">
            {/* Decorative accents */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[rgba(245,158,11,0.05)] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[rgba(16,185,129,0.04)] blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8">
              {/* SVG Ring Chart */}
              <div className="relative">
                <svg
                  width={size}
                  height={size}
                  viewBox={`0 0 ${size} ${size}`}
                  className="transform -rotate-90"
                >
                  {ringElements.map((ring) => (
                    <g key={ring.slug}>
                      {/* Background track */}
                      <circle
                        cx={center}
                        cy={center}
                        r={ring.radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={ringWidth}
                      />
                      {/* Score arc */}
                      <circle
                        cx={center}
                        cy={center}
                        r={ring.radius}
                        fill="none"
                        stroke={ring.color}
                        strokeWidth={ring.isHovered ? ringWidth + 3 : ringWidth}
                        strokeDasharray={ring.circumference}
                        strokeDashoffset={ring.offset}
                        strokeLinecap="round"
                        className="ring-animated transition-all duration-300"
                        style={
                          {
                            "--ring-circumference": ring.circumference,
                            "--ring-offset": ring.offset,
                            opacity: ring.isHovered ? 1 : 0.85,
                            filter: ring.isHovered
                              ? `drop-shadow(0 0 6px ${ring.color}66)`
                              : "none",
                          } as React.CSSProperties
                        }
                        onMouseEnter={() => setHoveredRing(ring.slug)}
                        onMouseLeave={() => setHoveredRing(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center transform">
                  <div className="text-3xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums gradient-text-animated">
                    {overallAvg}
                  </div>
                  <div className="text-[10px] text-[#55556a] uppercase tracking-widest mt-1">
                    Overall Avg
                  </div>
                </div>
              </div>

              {/* Legend + hovered detail */}
              <div className="flex flex-col gap-3 min-w-[180px]">
                {rings.map((ring) => {
                  const isHovered = hoveredRing === ring.slug;
                  return (
                    <motion.div
                      key={ring.slug}
                      animate={{
                        scale: isHovered ? 1.05 : 1,
                        opacity: hoveredRing && !isHovered ? 0.5 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 cursor-pointer"
                      onMouseEnter={() => setHoveredRing(ring.slug)}
                      onMouseLeave={() => setHoveredRing(null)}
                    >
                      <span
                        className="shrink-0 w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ring.color,
                          boxShadow: isHovered
                            ? `0 0 8px ${ring.color}66`
                            : "none",
                        }}
                      />
                      <span className="text-sm text-[#f5f5f7] flex-1">
                        {ring.name}
                      </span>
                      <span
                        className="text-sm font-[family-name:var(--font-geist-mono)] tabular-nums font-bold"
                        style={{ color: ring.color }}
                      >
                        {ring.score}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
