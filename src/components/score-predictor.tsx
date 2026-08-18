"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calculator,
  ChevronDown,
  Loader2,
  Brain,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModelsResponse, BenchmarksResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

interface ScorePredictorProps {
  modelsData: ModelsResponse | null;
  benchmarksData: BenchmarksResponse | null;
  isLoading: boolean;
}

/* ===== Prediction Logic ===== */
function predictScore(
  modelSlug: string,
  domainSlug: string,
  modelsData: ModelsResponse | null,
  benchmarksData: BenchmarksResponse | null
): { predicted: number; confidence: number; similarModels: { name: string; score: number; provider: string }[] } | null {
  if (!modelsData || !benchmarksData) return null;

  const model = modelsData.models.find((m) => m.slug === modelSlug);
  if (!model) return null;

  // Get the model's category scores
  const categoryScores = model.categoryScores ?? {};
  const domainScore = categoryScores[domainSlug];

  // Get all benchmarks in this domain
  const domainCategory = benchmarksData.categories.find(
    (c) => c.slug === domainSlug
  );
  if (!domainCategory) return null;

  // Calculate domain-specific score from benchmark results
  const domainBenchmarks = domainCategory.benchmarks;
  let modelDomainScore = domainScore ?? model.overallScore ?? 50;

  // Find similar models (same provider or close overall score)
  const allModels = modelsData.models;
  const similarModels = allModels
    .filter((m) => m.slug !== modelSlug)
    .map((m) => {
      const mDomainScore = m.categoryScores?.[domainSlug] ?? m.overallScore ?? 50;
      const scoreDiff = Math.abs(mDomainScore - modelDomainScore);
      const sameProvider = m.provider === model.provider;
      // Similarity: closer score + same provider bonus
      const similarity = (100 - scoreDiff) + (sameProvider ? 15 : 0);
      return { model: m, domainScore: mDomainScore, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  // Weighted prediction: 60% own category score + 20% overall + 20% similar models avg
  const overallScore = model.overallScore ?? 50;
  const similarAvg =
    similarModels.length > 0
      ? similarModels.reduce((s, m) => s + m.domainScore, 0) /
        similarModels.length
      : modelDomainScore;

  const predicted =
    0.6 * modelDomainScore + 0.2 * overallScore + 0.2 * similarAvg;

  // Confidence interval: based on score variance across categories
  const scoreValues = Object.values(categoryScores);
  const avgScore =
    scoreValues.length > 0
      ? scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length
      : overallScore;
  const variance =
    scoreValues.length > 1
      ? scoreValues.reduce((s, v) => s + Math.pow(v - avgScore, 2), 0) /
        scoreValues.length
      : 100;
  const confidence = Math.min(Math.round(Math.sqrt(variance) * 1.96), 15);

  return {
    predicted: Math.round(predicted * 10) / 10,
    confidence,
    similarModels: similarModels.map((m) => ({
      name: m.model.name,
      score: Math.round(m.domainScore * 10) / 10,
      provider: m.model.provider,
    })),
  };
}

/* ===== Spinning Number Effect ===== */
function SpinningNumber({ target, isActive }: { target: number; isActive: boolean }) {
  const [display, setDisplay] = useState(() => target);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      let current = 0;
      intervalRef.current = setInterval(() => {
        current += (target - current) * 0.15 + Math.random() * 2;
        if (current > target) current = target;
        const nextVal = Math.round(current * 10) / 10;
        setDisplay(nextVal);
        if (Math.abs(current - target) < 0.1) {
          setDisplay(target);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 50);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, isActive]);

  return (
    <span className="font-[family-name:var(--font-geist-mono)] tabular-nums">
      {display.toFixed(1)}
    </span>
  );
}

export function ScorePredictor({
  modelsData,
  benchmarksData,
  isLoading,
}: ScorePredictorProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<{
    predicted: number;
    confidence: number;
    similarModels: { name: string; score: number; provider: string }[];
  } | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  const categories = useMemo(
    () => benchmarksData?.categories ?? [],
    [benchmarksData]
  );
  const models = useMemo(() => modelsData?.models ?? [], [modelsData]);

  const handlePredict = async () => {
    if (!selectedModel || !selectedDomain) return;

    setIsPredicting(true);
    setPrediction(null);

    // Simulate calculation delay for effect
    await new Promise((r) => setTimeout(r, 1200));

    const result = predictScore(
      selectedModel,
      selectedDomain,
      modelsData,
      benchmarksData
    );
    setPrediction(result);
    setIsPredicting(false);
  };

  const scoreColor = prediction
    ? prediction.predicted >= 80
      ? "#10b981"
      : prediction.predicted >= 60
        ? "#f59e0b"
        : "#f97316"
    : "#8b8b9e";

  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="11" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Score Predictor
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Estimate a model&apos;s expected score on a domain — powered by existing
          evaluation data
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-xl"
        >
          <div className="glass-card p-6 md:p-8 space-y-5 relative overflow-hidden">
            {/* Decorative accents */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[rgba(245,158,11,0.05)] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[rgba(16,185,129,0.04)] blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Icon + Title */}
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-[#f59e0b]" />
                <span className="text-sm font-semibold text-[#f5f5f7]">
                  Predict Score
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-10 w-full rounded-lg bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-10 w-full rounded-lg bg-[rgba(255,255,255,0.04)]" />
                </div>
              ) : (
                <>
                  {/* Model Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8b8b9e]">
                      Model
                    </label>
                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                      disabled={isPredicting}
                    >
                      <SelectTrigger className="dark-select-trigger !rounded-xl h-10">
                        <SelectValue placeholder="Choose a model…" />
                      </SelectTrigger>
                      <SelectContent className="dark-select-content !rounded-xl">
                        {models.map((m) => (
                          <SelectItem key={m.slug} value={m.slug}>
                            {m.name}{" "}
                            <span className="text-[#55556a] text-xs">
                              ({m.provider})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Domain Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8b8b9e]">
                      Domain
                    </label>
                    <Select
                      value={selectedDomain}
                      onValueChange={setSelectedDomain}
                      disabled={isPredicting}
                    >
                      <SelectTrigger className="dark-select-trigger !rounded-xl h-10">
                        <SelectValue placeholder="Choose a domain…" />
                      </SelectTrigger>
                      <SelectContent className="dark-select-content !rounded-xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Predict Button */}
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#0a0a0f] transition-all hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed pulse-glow-saffron"
                    disabled={!selectedModel || !selectedDomain || isPredicting}
                    onClick={handlePredict}
                  >
                    {isPredicting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calculating…
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4" />
                        Predict Score
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Prediction Result */}
              <AnimatePresence>
                {prediction && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className="space-y-4"
                  >
                    {/* Score display */}
                    <div className="glass-card p-5 text-center">
                      <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-2 font-medium">
                        Predicted Score
                      </div>
                      <div
                        className="text-4xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums mb-1"
                        style={{ color: scoreColor }}
                      >
                        <SpinningNumber
                          target={prediction.predicted}
                          isActive={isPredicting}
                        />
                      </div>
                      <div className="text-xs text-[#55556a] font-[family-name:var(--font-geist-mono)] tabular-nums">
                        ± {prediction.confidence} confidence interval
                      </div>

                      {/* Score bar */}
                      <div className="mt-4 h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: scoreColor }}
                          initial={{ width: "0%" }}
                          animate={{
                            width: `${Math.min(prediction.predicted, 100)}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-[#55556a] font-[family-name:var(--font-geist-mono)]">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>

                    {/* Similar models */}
                    {prediction.similarModels.length > 0 && (
                      <div>
                        <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                          <Brain className="h-3 w-3" />
                          Top Similar Models
                        </div>
                        <div className="space-y-1.5">
                          {prediction.similarModels.map((sm, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: i * 0.1,
                              }}
                              className="flex items-center justify-between px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[#f5f5f7]">
                                  {sm.name}
                                </span>
                                <span className="text-[10px] text-[#55556a]">
                                  {sm.provider}
                                </span>
                              </div>
                              <span
                                className="text-xs font-[family-name:var(--font-geist-mono)] tabular-nums font-medium"
                                style={{
                                  color:
                                    sm.score >= 80
                                      ? "#10b981"
                                      : sm.score >= 60
                                        ? "#f59e0b"
                                        : "#f97316",
                                }}
                              >
                                {sm.score.toFixed(1)}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Methodology expandable */}
                    <button
                      onClick={() => setShowMethodology(!showMethodology)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-[#8b8b9e] hover:text-[#f5f5f7] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calculator className="h-3 w-3" />
                        How we estimate
                      </span>
                      <motion.span
                        animate={{ rotate: showMethodology ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {showMethodology && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="glass-card p-3.5 text-xs text-[#8b8b9e] leading-relaxed space-y-2">
                            <p>
                              <strong className="text-[#f5f5f7]">Formula:</strong>{" "}
                              Predicted = 0.6 × Domain Score + 0.2 × Overall
                              Score + 0.2 × Similar Models Average
                            </p>
                            <p>
                              <strong className="text-[#f5f5f7]">Confidence:</strong>{" "}
                              ±1.96σ based on score variance across categories.
                              Wider intervals indicate models with inconsistent
                              cross-domain performance.
                            </p>
                            <p>
                              <strong className="text-[#f5f5f7]">Similarity:</strong>{" "}
                              Models ranked by domain score proximity and same-provider
                              bonus. This is an estimation tool, not a guarantee.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
