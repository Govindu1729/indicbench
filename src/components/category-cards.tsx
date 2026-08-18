"use client";

import { motion } from "framer-motion";
import { Scale, HeartPulse, Landmark, Languages, GraduationCap } from "lucide-react";
import type { Category } from "@/lib/api";

interface CategoryCardsProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
  activeCategory: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Scale,
  HeartPulse,
  Landmark,
  Languages,
  GraduationCap,
};

const DEFAULT_ICONS: Record<string, React.ElementType> = {
  legal: Scale,
  healthcare: HeartPulse,
  fintech: Landmark,
  vernacular: Languages,
  education: GraduationCap,
};

function MiniScoreGauge({ score, size = 24 }: { score: number; size?: number }) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f97316";
  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

/**
 * Category cards — responsive, works well in split windows.
 * Uses a compact grid that doesn't overflow.
 */
export function CategoryCards({ categories, onCategoryClick, activeCategory }: CategoryCardsProps) {
  return (
    <section className="relative py-10 md:py-14">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-lg sm:text-xl font-bold md:text-2xl font-[family-name:var(--font-playfair)]">
            Benchmark Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#8b8b9e] mt-1">
            Five domains critical to India&apos;s AI future
          </p>
        </motion.div>

        {/* Grid layout — responsive, no horizontal scroll overflow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat, i) => {
            const IconComponent = ICON_MAP[cat.icon] || DEFAULT_ICONS[cat.slug] || Scale;
            const isActive = activeCategory === cat.slug;
            const numBenchmarks = cat.numBenchmarks ?? cat.benchmarks?.length ?? 0;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div
                  className={`group cursor-pointer glass-card glass-card-hover p-3 sm:p-4 md:p-5 transition-all duration-300 ${
                    isActive ? "border-[rgba(255,255,255,0.15)]" : ""
                  }`}
                  style={isActive ? { borderColor: `${cat.color}60`, boxShadow: `0 0 15px ${cat.color}15` } : {}}
                  onClick={() => onCategoryClick(isActive ? "" : cat.slug)}
                >
                  {/* Icon */}
                  <div
                    className="mb-2 sm:mb-3 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  {/* Name */}
                  <h3 className="mb-0.5 sm:mb-1 text-sm sm:text-base font-semibold font-[family-name:var(--font-playfair)] text-[#f5f5f7] truncate">
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-[#55556a] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Bottom: benchmark count + top model */}
                  <div className="flex items-center justify-between">
                    <div
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium"
                      style={{ backgroundColor: `${cat.color}12`, color: cat.color, border: `1px solid ${cat.color}25` }}
                    >
                      {numBenchmarks} tests
                    </div>
                    {cat.topModel && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] sm:text-[10px] text-[#8b8b9e] truncate max-w-[60px] sm:max-w-[80px]">
                          {cat.topModel.name}
                        </span>
                        <MiniScoreGauge score={cat.topModel.score} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
