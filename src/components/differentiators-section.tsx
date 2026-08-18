"use client";

import { motion } from "framer-motion";
import { Flag, ShieldCheck, Globe, Coins, Unlock } from "lucide-react";
import { SectionNumber } from "@/components/section-number";

const DIFFERENTIATORS = [
  {
    icon: Flag,
    title: "India-First",
    description: "Only benchmark suite designed specifically for Indian AI use cases — from IPC sections to UPI limits.",
    color: "#f59e0b",
    emoji: "🇮🇳",
  },
  {
    icon: ShieldCheck,
    title: "Expert Validated",
    description: "Every question reviewed by domain professionals — lawyers, doctors, financial analysts, educators.",
    color: "#10b981",
    emoji: "🏛️",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Benchmarks in Hindi, Tamil, Bengali, Telugu, Punjabi, and 10+ Indian languages.",
    color: "#8b5cf6",
    emoji: "🌐",
  },
  {
    icon: Coins,
    title: "Cost-Aware Scoring",
    description: "We measure not just accuracy, but also cost and latency — real-world metrics that matter for deployment.",
    color: "#f97316",
    emoji: "💰",
  },
  {
    icon: Unlock,
    title: "Open & Reproducible",
    description: "All evaluation code and data publicly available for verification. No black boxes.",
    color: "#0d9488",
    emoji: "🔓",
  },
];

export function DifferentiatorsSection() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="relative mb-2 text-center">
          <SectionNumber number="02.5" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Why IndicBench?
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Key differentiators vs generic AI benchmarks
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DIFFERENTIATORS.map((diff, i) => {
            const Icon = diff.icon;
            return (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card glass-card-hover glass-card-shine p-5 md:p-6 flex flex-col items-center text-center group"
              >
                {/* Emoji badge */}
                <div className="mb-3 text-2xl" aria-hidden="true">
                  {diff.emoji}
                </div>

                {/* Icon with pulse */}
                <div
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl diff-icon-pulse"
                  style={{
                    backgroundColor: `${diff.color}15`,
                    color: diff.color,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-base font-semibold font-[family-name:var(--font-playfair)] text-[#f5f5f7]">
                  {diff.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#8b8b9e] leading-relaxed">
                  {diff.description}
                </p>

                {/* Bottom accent line */}
                <div
                  className="mt-4 h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-12"
                  style={{ backgroundColor: `${diff.color}40` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
