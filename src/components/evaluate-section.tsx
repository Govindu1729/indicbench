"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, CheckCircle2, XCircle, Eye, Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { SectionNumber } from "@/components/section-number";
import { runEvaluation } from "@/lib/api";
import { getQuestionsByCategory } from "@/lib/sample-questions";
import type { BenchmarksResponse, ModelsResponse, EvaluateResponse, SampleQuestion } from "@/lib/api";
import { ScoreGauge } from "@/components/shared-ui";

interface EvaluateSectionProps {
  benchmarksData: BenchmarksResponse | null;
  modelsData: ModelsResponse | null;
  isLoading: boolean;
  onEvalComplete?: () => void;
}

type EvalStep = "select" | "running" | "complete";



/* ===== Multi-Step Progress Indicator ===== */
const STEPS: { key: EvalStep; label: string; num: number }[] = [
  { key: "select", label: "Select", num: 1 },
  { key: "running", label: "Running", num: 2 },
  { key: "complete", label: "Complete", num: 3 },
];

function StepIndicator({ currentStep }: { currentStep: EvalStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentIndex;
        const isCompleted = idx < currentIndex;
        const isUpcoming = idx > currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isCompleted
                    ? "#10b981"
                    : isActive
                      ? "#f59e0b"
                      : "rgba(255,255,255,0.06)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors"
                style={{
                  borderColor: isCompleted
                    ? "#10b981"
                    : isActive
                      ? "#f59e0b"
                      : "rgba(255,255,255,0.12)",
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </motion.div>
                ) : (
                  <span
                    className={`text-xs font-bold font-[family-name:var(--font-geist-mono)] ${
                      isActive ? "text-[#0a0a0f]" : "text-[#8b8b9e]"
                    }`}
                  >
                    {step.num}
                  </span>
                )}
                {/* Active pulse ring */}
                {isActive && currentStep === "running" && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#f59e0b]"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.div>
              <span
                className={`mt-1.5 text-[10px] font-medium transition-colors ${
                  isCompleted
                    ? "text-[#10b981]"
                    : isActive
                      ? "text-[#f59e0b]"
                      : "text-[#55556a]"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className="relative w-12 h-0.5 mx-2 mt-[-12px]">
                <div className="absolute inset-0 bg-[rgba(255,255,255,0.08)] rounded-full" />
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  initial={false}
                  animate={{
                    width: isCompleted ? "100%" : "0%",
                    backgroundColor: "#10b981",
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===== Progress Bar with Shimmer ===== */
function EvalProgressBar({ progress, timeRemaining }: { progress: number; timeRemaining: number }) {
  return (
    <div className="space-y-2">
      <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981] eval-shimmer-bar"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#8b8b9e] font-[family-name:var(--font-geist-mono)]">
          {Math.round(progress)}%
        </span>
        {timeRemaining > 0 && (
          <span className="text-[#55556a] font-[family-name:var(--font-geist-mono)]">
            ~{timeRemaining}s remaining
          </span>
        )}
      </div>
    </div>
  );
}

export function EvaluateSection({ benchmarksData, modelsData, isLoading, onEvalComplete }: EvaluateSectionProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluateResponse["results"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking
  const [evalProgress, setEvalProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allModels = useMemo(() => modelsData?.models ?? [], [modelsData]);

  const currentStep: EvalStep = evaluating ? "running" : result ? "complete" : "select";

  // Clean up intervals
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  const handleRun = async () => {
    if (!selectedModel || !selectedBenchmark) return;
    setEvaluating(true);
    setResult(null);
    setError(null);
    setEvalProgress(0);
    setTimeRemaining(5);

    // Start simulated progress
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 90) progress = 90;
      setEvalProgress(progress);
    }, 400);

    let timeLeft = 5;
    timeIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft < 0) timeLeft = 0;
      setTimeRemaining(timeLeft);
    }, 1000);

    try {
      const res = await runEvaluation(selectedModel, selectedBenchmark, 5);
      // Complete the progress
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      setEvalProgress(100);
      setTimeRemaining(0);
      // Small delay to show 100% before result
      await new Promise((r) => setTimeout(r, 400));
      setResult(res.results);
      onEvalComplete?.();
    } catch (err: unknown) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <section id="evaluate" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="relative mb-2 text-center">
          <SectionNumber number="07" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Run Live Evaluation
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Test any model on any benchmark — see results in real time
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-2xl"
        >
          <div className="glass-card p-6 md:p-8 space-y-5 relative overflow-hidden">
            {/* Decorative mesh accent */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[rgba(245,158,11,0.05)] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[rgba(16,185,129,0.04)] blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Multi-Step Progress Indicator */}
              <StepIndicator currentStep={currentStep} />

              {isLoading ? (
                <>
                  <div className="h-10 w-full rounded-lg bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-10 w-full rounded-lg bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-10 w-32 rounded-lg bg-[rgba(255,255,255,0.04)]" />
                </>
              ) : (
                <>
                  {/* Model Select */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#f5f5f7]">Select Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel} disabled={evaluating}>
                      <SelectTrigger className="dark-select-trigger !rounded-xl h-11">
                        <SelectValue placeholder="Choose a model…" />
                      </SelectTrigger>
                      <SelectContent className="dark-select-content !rounded-xl">
                        {allModels.map((m) => (
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

                  {/* Benchmark Select */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#f5f5f7]">Select Benchmark</label>
                    <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark} disabled={evaluating}>
                      <SelectTrigger className="dark-select-trigger !rounded-xl h-11">
                        <SelectValue placeholder="Choose a benchmark…" />
                      </SelectTrigger>
                      <SelectContent className="dark-select-content !rounded-xl">
                        {(benchmarksData?.categories ?? []).map((cat) =>
                          cat.benchmarks.map((bm) => (
                            <SelectItem key={bm.slug} value={bm.slug}>
                              <span className="text-[#55556a] text-xs">
                                [{cat.name}]
                              </span>{" "}
                              {bm.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sample Questions Preview */}
                  <AnimatePresence>
                    {selectedBenchmark && (() => {
                      const selectedCat = (benchmarksData?.categories ?? []).find((cat) =>
                        cat.benchmarks.some((bm) => bm.slug === selectedBenchmark)
                      );
                      const previewQuestions = selectedCat
                        ? getQuestionsByCategory(selectedCat.slug).slice(0, 3)
                        : [];
                      return previewQuestions.length > 0 ? (
                        <motion.div
                          key="sample-preview"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="glass-card p-3.5 space-y-2.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-[#8b8b9e] uppercase tracking-wider font-medium">
                              <Eye className="h-3 w-3" />
                              Preview — {selectedCat?.name ?? "Questions"}
                            </div>
                            {previewQuestions.map((q, qi) => (
                              <div
                                key={qi}
                                className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] px-3 py-2"
                              >
                                <div className="text-xs text-[#f5f5f7] leading-relaxed line-clamp-2">
                                  {q.question}
                                </div>
                                <div className="mt-1 text-[10px] text-[#55556a]">
                                  Answer: <span className="text-[#8b8b9e]">{q.expectedAnswer}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : null;
                    })()}
                  </AnimatePresence>

                  {/* Progress bar when running */}
                  <AnimatePresence>
                    {evaluating && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EvalProgressBar progress={evalProgress} timeRemaining={timeRemaining} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Run Button */}
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3.5 text-base font-semibold text-[#0a0a0f] transition-all hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed pulse-glow-saffron"
                    disabled={!selectedModel || !selectedBenchmark || evaluating}
                    onClick={handleRun}
                  >
                    {evaluating ? (
                      <>
                        <div className="w-5 h-5 spin-ring" />
                        Evaluating…
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Run Evaluation
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] p-4 text-sm text-[#ef4444]">
                  {error}
                </div>
              )}

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Score result card */}
                    <div className="glass-card p-5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-[#f5f5f7]">
                          {result.model} on {result.benchmark}
                        </div>
                        <div className="text-xs text-[#55556a] mt-0.5">
                          {result.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ScoreGauge score={result.score} size={56} strokeWidth={3.5} />
                        <div className="text-right">
                          <div className="text-2xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums gradient-text-gold">
                            {result.score}%
                          </div>
                          <div className="text-xs text-[#55556a] font-[family-name:var(--font-geist-mono)]">
                            {result.numCorrect}/{result.numTotal}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Questions */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {result.sampleQuestions.map(
                        (q: SampleQuestion, i: number) => (
                          <div
                            key={i}
                            className={`rounded-xl border p-3 text-sm transition-colors ${
                              q.isCorrect
                                ? "border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)]"
                                : "border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.04)]"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {q.isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-[#10b981] shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 mt-0.5 text-[#ef4444] shrink-0" />
                              )}
                              <div className="space-y-1 min-w-0">
                                <div className="font-medium text-[#f5f5f7]">{q.question}</div>
                                <div className="text-xs text-[#8b8b9e]">
                                  <span className="text-[#10b981]">Expected:</span>{" "}
                                  {q.expectedAnswer}
                                </div>
                                <div className="text-xs text-[#8b8b9e]">
                                  <span className="text-[#55556a]">Model:</span>{" "}
                                  {q.modelAnswer}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Share & Download buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          const summary = [
                            `IndicBench Evaluation Result`,
                            `===========================`,
                            `Model: ${result.model}`,
                            `Benchmark: ${result.benchmark}`,
                            `Category: ${result.category}`,
                            `Score: ${result.score}%`,
                            `Correct: ${result.numCorrect}/${result.numTotal}`,
                            ``,
                            `Sample Questions:`,
                            ...result.sampleQuestions.map(
                              (q, i) =>
                                `${i + 1}. ${q.isCorrect ? "\u2705" : "\u274c"} ${q.question}\n   Expected: ${q.expectedAnswer}\n   Model: ${q.modelAnswer}`
                            ),
                          ].join("\n");
                          navigator.clipboard.writeText(summary).then(() => {
                            toast.success("Results copied to clipboard!");
                          }).catch(() => {
                            toast.error("Failed to copy results");
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl glass-card glass-card-hover px-4 py-2.5 text-xs font-medium text-[#f5f5f7] hover:!border-[rgba(245,158,11,0.4)] hover:!text-[#f59e0b] transition-all"
                        aria-label="Share evaluation results"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share Results
                      </button>
                      <button
                        onClick={() => {
                          const json = JSON.stringify(result, null, 2);
                          const blob = new Blob([json], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `indicbench-eval-${result.modelSlug}-${result.benchmarkSlug}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast.success("JSON downloaded!");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl glass-card glass-card-hover px-4 py-2.5 text-xs font-medium text-[#f5f5f7] hover:!border-[rgba(245,158,11,0.4)] hover:!text-[#f59e0b] transition-all"
                        aria-label="Download results as JSON"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download JSON
                      </button>
                    </div>
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
