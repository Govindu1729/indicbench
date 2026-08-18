"use client";

import { motion } from "framer-motion";
import { Zap, Globe, BarChart3, Target, Shield } from "lucide-react";
import { TypingText } from "@/components/typing-text";
import { ScoreGauge, AnimatedCounter } from "@/components/shared-ui";

interface HeroSectionProps {
  stats: {
    benchmarks: number;
    models: number;
    evaluations: number;
    questions: number;
  } | null;
}

/**
 * Compact hero section — no more min-h-[85vh] that causes overflow in split windows.
 * Uses relative positioning and contained animations.
 */
export function HeroSection({ stats }: HeroSectionProps) {
  const totalBenchmarks = stats?.benchmarks ?? 17;

  return (
    <section className="relative overflow-hidden">
      {/* Background effects — contained within section */}
      <div className="absolute inset-0 aurora-bg opacity-50" />
      <div className="absolute inset-0 mesh-gradient-hero opacity-60" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Gradient orbs — smaller and contained */}
      <div className="absolute -top-20 -left-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[rgba(245,158,11,0.06)] blur-[80px] animate-pulse" aria-hidden="true" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-[rgba(16,185,129,0.05)] blur-[60px] animate-pulse" style={{ animationDelay: "-2s" }} aria-hidden="true" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[rgba(139,92,250,0.04)] blur-[50px] animate-pulse" style={{ animationDelay: "-4s" }} aria-hidden="true" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center py-10 sm:py-14 md:py-16">
        {/* Small-caps label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 glass-card badge-shine"
        >
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] glow-saffron-sm" />
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] text-[#8b8b9e]">
            India&apos;s AI Benchmark
          </span>
        </motion.div>

        {/* Editorial serif heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-[family-name:var(--font-playfair)]"
        >
          <span className="gradient-text-animated">
            IndicBench
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-6 max-w-xl text-xs sm:text-sm text-[#8b8b9e] md:text-base leading-relaxed px-4"
        >
          <TypingText
            text="India's first comprehensive AI benchmark suite — evaluating LLMs on Legal, Healthcare, Fintech, Vernacular & Education tasks that matter for a billion people."
            speed={30}
            delay={600}
          />
        </motion.p>

        {/* Stats as compact glass cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-6 grid max-w-2xl grid-cols-2 gap-2 sm:gap-3 md:flex md:items-center md:justify-center md:gap-3"
        >
          {[
            { value: stats?.benchmarks ?? 17, label: "Benchmarks", gauge: 85 },
            { value: stats?.models ?? 10, label: "AI Models", gauge: 70 },
            { value: stats?.evaluations ?? 170, label: "Evaluations", gauge: 92 },
            { value: stats?.questions ?? 3500, label: "Questions", gauge: 78 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card glass-card-hover flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3"
            >
              <ScoreGauge score={stat.gauge} size={30} strokeWidth={2.5} />
              <div className="text-left">
                <div className="text-base sm:text-lg font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7] md:text-xl">
                  <AnimatedCounter target={stat.value} />
                </div>
                <div className="text-[8px] sm:text-[9px] text-[#55556a] uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Institutional Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="institutional-badge institutional-badge-shine">
            <Shield className="h-3 w-3 text-[#f59e0b]" />
            <span className="text-[9px] sm:text-[10px] font-medium text-[#8b8b9e] tracking-wider uppercase">
              Trusted by IIT Gandhinagar
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] text-[#55556a] tracking-wider uppercase">
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f59e0b]" />
              IndiaAI Mission
            </span>
            <span className="text-[#33334a]">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#10b981]" />
              NITI Aayog
            </span>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar — compact horizontal strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-10 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(10,10,15,0.5)] backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: Zap, value: totalBenchmarks, label: "Domain Benchmarks", color: "#f59e0b" },
              { icon: Globe, value: 5, label: "Indian Languages", color: "#10b981" },
              { icon: BarChart3, value: stats?.evaluations ?? 170, label: "Eval Runs", color: "#a78bfa" },
              { icon: Target, value: 86, label: "Avg Top Score", color: "#f97316", suffix: "%" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 ${idx < 2 ? "border-b border-[rgba(255,255,255,0.04)] md:border-b-0" : ""}`}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" style={{ color: item.color }} />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#f5f5f7] font-[family-name:var(--font-geist-mono)] tabular-nums">
                      <AnimatedCounter target={item.value} suffix={item.suffix ?? ""} />
                    </span>
                    <span className="hidden sm:inline text-[8px] sm:text-[9px] text-[#55556a] uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
