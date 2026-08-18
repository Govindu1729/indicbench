"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Swords, Trophy, RotateCcw, Sparkles } from "lucide-react";
import type { ModelsResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";
import { ScoreGauge, ProviderBadge } from "@/components/shared-ui";

interface ModelBattleProps {
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
const CATEGORY_COLORS: Record<string, string> = {
  legal: "#f59e0b",
  healthcare: "#10b981",
  fintech: "#60a5fa",
  vernacular: "#a78bfa",
  education: "#f97316",
};

/* ===== Confetti Particle ===== */
function BattleParticles({ active }: { active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.2 + Math.random() * 1.2,
        size: 4 + Math.random() * 6,
        color: ["#f59e0b", "#10b981", "#a78bfa", "#f97316", "#60a5fa"][i % 5],
      })),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: "100%", x: `${p.x}%`, opacity: 1, scale: 1 }}
              animate={{ y: "-20%", opacity: 0, scale: 0.3, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                left: `${p.x}%`,
                bottom: 0,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

/* ===== VS Badge with Fire Animation ===== */
function VSBadge() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 20px rgba(245,158,11,0.3), 0 0 40px rgba(239,68,68,0.2)",
            "0 0 35px rgba(245,158,11,0.5), 0 0 60px rgba(239,68,68,0.3)",
            "0 0 20px rgba(245,158,11,0.3), 0 0 40px rgba(239,68,68,0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[rgba(245,158,11,0.5)] bg-gradient-to-br from-[rgba(245,158,11,0.15)] to-[rgba(239,68,68,0.15)]"
      >
        {/* Fire flicker particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8 - Math.random() * 6],
              opacity: [0.8, 0],
              scale: [1, 0.4],
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              width: 4 + i * 0.5,
              height: 4 + i * 0.5,
              backgroundColor: i % 2 === 0 ? "#f59e0b" : "#ef4444",
              left: `${35 + (i - 2) * 8}%`,
              top: "20%",
            }}
          />
        ))}
        <span className="text-xl md:text-2xl font-black text-[#f5f5f7] font-[family-name:var(--font-geist-mono)] tracking-tight">
          VS
        </span>
      </motion.div>
    </div>
  );
}

/* ===== Score Bar (slides from left or right) ===== */
function BattleScoreBar({
  score,
  label,
  color,
  fromLeft = true,
  delay = 0,
}: {
  score: number;
  label: string;
  color: string;
  fromLeft?: boolean;
  delay?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {!fromLeft && (
        <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums font-bold w-10 text-right" style={{ color }}>
          {score.toFixed(1)}
        </span>
      )}
      <div className="flex-1 h-7 rounded-md bg-[rgba(255,255,255,0.04)] overflow-hidden relative">
        <motion.div
          initial={fromLeft ? { scaleX: 0, originX: 0 } : { scaleX: 0, originX: 1 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-md"
          style={{
            width: `${score}%`,
            background: `linear-gradient(${fromLeft ? "90deg" : "270deg"}, ${color}50, ${color}20)`,
            border: `1px solid ${color}40`,
            transformOrigin: fromLeft ? "left" : "right",
          }}
        />
      </div>
      {fromLeft && (
        <span className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums font-bold w-10" style={{ color }}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function ModelBattle({ data, isLoading }: ModelBattleProps) {
  const [modelAId, setModelAId] = useState<string>("");
  const [modelBId, setModelBId] = useState<string>("");
  const [showParticles, setShowParticles] = useState(false);
  const particlesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const models = useMemo(() => data?.models ?? [], [data]);
  const modelA = useMemo(() => models.find((m) => m.id === modelAId) ?? null, [models, modelAId]);
  const modelB = useMemo(() => models.find((m) => m.id === modelBId) ?? null, [models, modelBId]);

  // Auto battle key derived from model selection (triggers re-animation)
  const battleKey = useMemo(() => {
    if (modelAId && modelBId) return `${modelAId}_${modelBId}`;
    return "empty";
  }, [modelAId, modelBId]);

  // Determine winner
  const winner = useMemo(() => {
    if (!modelA || !modelB) return null;
    const scoreA = modelA.overallScore ?? 0;
    const scoreB = modelB.overallScore ?? 0;
    if (scoreA > scoreB) return "A" as const;
    if (scoreB > scoreA) return "B" as const;
    return "tie" as const;
  }, [modelA, modelB]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!modelA || !modelB) return [];
    return CATEGORY_KEYS.map((key) => ({
      key,
      label: CATEGORY_LABELS[key],
      color: CATEGORY_COLORS[key],
      scoreA: modelA.categoryScores?.[key] ?? 0,
      scoreB: modelB.categoryScores?.[key] ?? 0,
      winner: (modelA.categoryScores?.[key] ?? 0) >= (modelB.categoryScores?.[key] ?? 0) ? ("A" as const) : ("B" as const),
    }));
  }, [modelA, modelB]);

  // Count category wins
  const winsA = useMemo(() => categoryBreakdown.filter((c) => c.winner === "A").length, [categoryBreakdown]);
  const winsB = useMemo(() => categoryBreakdown.filter((c) => c.winner === "B").length, [categoryBreakdown]);

  const handleReplay = useCallback(() => {
    setShowParticles(true);
    if (particlesTimeout.current) clearTimeout(particlesTimeout.current);
    particlesTimeout.current = setTimeout(() => setShowParticles(false), 2500);
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto mb-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
          <div className="h-64 rounded-xl bg-[rgba(255,255,255,0.03)]" />
        </div>
      </section>
    );
  }

  return (
    <section id="battle" className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-section" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="07" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Model Battle
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Head-to-head AI showdown — pick two models and see who dominates
        </motion.p>

        {/* Model Selectors */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          <div>
            <label className="block text-xs text-[#f59e0b] uppercase tracking-wider mb-2 font-medium">
              Challenger
            </label>
            <Select value={modelAId} onValueChange={setModelAId}>
              <SelectTrigger className="w-full dark-select-trigger !rounded-xl !h-11 border-[rgba(245,158,11,0.2)]">
                <SelectValue placeholder="Select challenger..." />
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
            <label className="block text-xs text-[#10b981] uppercase tracking-wider mb-2 font-medium">
              Defender
            </label>
            <Select value={modelBId} onValueChange={setModelBId}>
              <SelectTrigger className="w-full dark-select-trigger !rounded-xl !h-11 border-[rgba(16,185,129,0.2)]">
                <SelectValue placeholder="Select defender..." />
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

        {/* Empty State */}
        {!modelA && !modelB && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center"
          >
            <Swords className="h-12 w-12 mx-auto mb-4 text-[#55556a]" />
            <p className="text-[#8b8b9e]">Choose two models to begin the battle</p>
          </motion.div>
        )}

        {(modelA || modelB) && (!modelA || !modelB) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center"
          >
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#55556a]" />
            <p className="text-[#8b8b9e]">
              Select {modelA ? "a defender" : "a challenger"} to start the showdown
            </p>
          </motion.div>
        )}

        {/* Battle Arena */}
        {modelA && modelB && (
          <motion.div
            key={battleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Particles */}
            <BattleParticles active={showParticles} />

            {/* Overall Score Cards + VS Badge */}
            <div className="glass-card glass-card-shine p-6 md:p-8 mb-8 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[rgba(245,158,11,0.06)] blur-3xl pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[rgba(16,185,129,0.06)] blur-3xl pointer-events-none" />

              <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
                {/* Model A Card */}
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-center md:text-left"
                >
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <ScoreGauge score={modelA.overallScore ?? 0} size={64} strokeWidth={4} />
                    <div>
                      <div className="font-semibold text-sm text-[#f5f5f7] truncate max-w-[200px]">
                        {modelA.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <ProviderBadge provider={modelA.provider} />
                        <span className="text-xs text-[#8b8b9e]">#{modelA.rank}</span>
                      </div>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "auto" }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-2 text-3xl font-black font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f59e0b]"
                    >
                      {(modelA.overallScore ?? 0).toFixed(1)}
                    </motion.div>
                  </div>
                </motion.div>

                {/* VS Badge */}
                <div className="flex justify-center">
                  <VSBadge />
                </div>

                {/* Model B Card */}
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-center md:text-right"
                >
                  <div className="flex flex-col items-center md:items-end gap-2">
                    <ScoreGauge score={modelB.overallScore ?? 0} size={64} strokeWidth={4} />
                    <div>
                      <div className="font-semibold text-sm text-[#f5f5f7] truncate max-w-[200px]">
                        {modelB.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <ProviderBadge provider={modelB.provider} />
                        <span className="text-xs text-[#8b8b9e]">#{modelB.rank}</span>
                      </div>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "auto" }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-2 text-3xl font-black font-[family-name:var(--font-geist-mono)] tabular-nums text-[#10b981]"
                    >
                      {(modelB.overallScore ?? 0).toFixed(1)}
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Winner Declaration */}
              <AnimatePresence mode="wait">
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-6 text-center"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 glass-card border-[rgba(245,158,11,0.2)]">
                      <Trophy
                        className="h-5 w-5"
                        style={{
                          color: winner === "tie" ? "#8b8b9e" : winner === "A" ? "#f59e0b" : "#10b981",
                        }}
                      />
                      <span className="text-sm font-bold">
                        {winner === "tie"
                          ? "It's a tie!"
                          : winner === "A"
                          ? `${modelA.name} wins!`
                          : `${modelB.name} wins!`}
                      </span>
                      <span className="text-xs text-[#55556a]">
                        ({winsA}–{winsB} categories)
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category-by-Category Breakdown */}
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-medium text-[#8b8b9e] uppercase tracking-wider">
                  Category Breakdown
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReplay}
                  className="text-[#55556a] hover:text-[#f59e0b]"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Replay
                </Button>
              </div>

              <div className="space-y-5">
                {categoryBreakdown.map((cat, idx) => {
                  const delayVal = idx * 0.08;
                  return (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: delayVal }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#f5f5f7]">{cat.label}</span>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                            border: `1px solid ${cat.color}30`,
                          }}
                        >
                          {cat.winner === "A" ? modelA.name.split(" ").slice(0, 2).join(" ") : modelB.name.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </div>
                      {/* Model A bar (from left) */}
                      <div className="mb-1.5">
                        <BattleScoreBar
                          score={cat.scoreA}
                          label={modelA.name}
                          color="#f59e0b"
                          fromLeft
                          delay={delayVal}
                        />
                      </div>
                      {/* Model B bar (from right) */}
                      <BattleScoreBar
                        score={cat.scoreB}
                        label={modelB.name}
                        color="#10b981"
                        fromLeft={false}
                        delay={delayVal + 0.05}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[rgba(245,158,11,0.4)] border border-[rgba(245,158,11,0.6)]" />
                  <span className="text-xs text-[#8b8b9e] truncate max-w-[140px]">{modelA.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[rgba(16,185,129,0.4)] border border-[rgba(16,185,129,0.6)]" />
                  <span className="text-xs text-[#8b8b9e] truncate max-w-[140px]">{modelB.name}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
