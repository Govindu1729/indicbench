"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";
import { SectionNumber } from "@/components/section-number";

/* ===== Types ===== */
interface EvalHistoryEntry {
  id: string;
  timestamp: number;
  modelName: string;
  benchmarkName: string;
  score: number;
  numCorrect: number;
  numTotal: number;
  pass: boolean;
}

const HISTORY_KEY = "indicbench-eval-history";
const PASS_THRESHOLD = 60;

/* ===== localStorage helpers (SSR-safe) ===== */
function getHistory(): EvalHistoryEntry[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: EvalHistoryEntry[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // noop
  }
}

/* ===== Seed some demo history entries ===== */
function seedDemoHistory(): EvalHistoryEntry[] {
  const now = Date.now();
  const models = ["Claude Opus 4", "GPT-4o", "Gemini 2.5 Pro", "Llama 3.1 405B", "Command R+"];
  const benchmarks = ["Indian Penal Code QA", "Ayurveda Diagnosis", "RBI Compliance Check", "Hindi Sentiment", "NCERT Class 10"];
  const entries: EvalHistoryEntry[] = [];

  for (let i = 0; i < 8; i++) {
    const score = 55 + Math.random() * 40;
    const numTotal = 5;
    const numCorrect = Math.round((score / 100) * numTotal);
    entries.push({
      id: `demo-${i}`,
      timestamp: now - (i * 12 + Math.floor(Math.random() * 5)) * 60 * 1000,
      modelName: models[i % models.length],
      benchmarkName: benchmarks[i % benchmarks.length],
      score: Math.round(score * 10) / 10,
      numCorrect,
      numTotal,
      pass: score >= PASS_THRESHOLD,
    });
  }

  return entries;
}

/* ===== Format relative time ===== */
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ===== Format absolute time ===== */
function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface EvaluationHistoryProps {
  /* Optional: listen for new eval completions to auto-add entries */
  latestEval?: {
    modelName: string;
    benchmarkName: string;
    score: number;
    numCorrect: number;
    numTotal: number;
  } | null;
}

export function EvaluationHistory({ latestEval }: EvaluationHistoryProps) {
  // Initialize state from localStorage lazily (SSR-safe)
  const [entries, setEntries] = useState<EvalHistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    let stored = getHistory();
    if (stored.length === 0) {
      stored = seedDemoHistory();
      saveHistory(stored);
    }
    return stored;
  });

  // Track previous latestEval to detect changes
  const prevEvalRef = useRef(latestEval);
  if (latestEval && latestEval !== prevEvalRef.current) {
    prevEvalRef.current = latestEval;
    // Add new entry synchronously via setState during render
    const newEntry: EvalHistoryEntry = {
      id: `eval-${Date.now()}`,
      timestamp: Date.now(),
      modelName: latestEval.modelName,
      benchmarkName: latestEval.benchmarkName,
      score: latestEval.score,
      numCorrect: latestEval.numCorrect,
      numTotal: latestEval.numTotal,
      pass: latestEval.score >= PASS_THRESHOLD,
    };
    const nextEntries = [newEntry, ...entries].slice(0, 50);
    saveHistory(nextEntries);
    // We'll set the state below via the re-render
    setEntries(nextEntries);
  }

  const handleClear = useCallback(() => {
    setEntries([]);
    saveHistory([]);
  }, []);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(entries, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `indicbench-eval-history-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [entries]);

  // Compute stats
  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const total = entries.length;
    const passed = entries.filter((e) => e.pass).length;
    const avgScore = entries.reduce((sum, e) => sum + e.score, 0) / total;
    return { total, passed, avgScore, passRate: (passed / total) * 100 };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="glass-card p-8 text-center max-w-lg mx-auto">
            <History className="h-10 w-10 mx-auto mb-3 text-[#55556a]" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-playfair)] text-[#f5f5f7] mb-2">
              No Evaluation History
            </h3>
            <p className="text-sm text-[#8b8b9e]">
              Run evaluations to build your history. Results are saved locally.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="relative mb-1">
              <SectionNumber number="09" />
              <h2 className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]">
                Evaluation History
              </h2>
            </div>
            <p className="text-sm text-[#8b8b9e]">
              Your local evaluation timeline — stored in your browser
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#8b8b9e] hover:text-[#f5f5f7] transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.12)] text-[#ef4444] hover:text-[#f87171] transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="flex items-center gap-4 mb-6 text-xs text-[#8b8b9e]">
            <span>{stats.total} evaluations</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
              {stats.passed} passed ({stats.passRate.toFixed(0)}%)
            </span>
            <span>Avg score: <span className="font-[family-name:var(--font-geist-mono)] text-[#f5f5f7]">{stats.avgScore.toFixed(1)}</span></span>
          </div>
        )}

        {/* Timeline */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, idx) => {
              const scoreColor = entry.score >= 80 ? "#10b981" : entry.score >= 60 ? "#f59e0b" : entry.score >= 40 ? "#f97316" : "#ef4444";
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15, height: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="relative flex items-stretch"
                >
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center w-6 shrink-0 py-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        entry.pass
                          ? "bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                          : "bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.3)]"
                      }`}
                    />
                    {idx < entries.length - 1 && (
                      <div className="flex-1 w-px bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-transparent mt-1" />
                    )}
                  </div>

                  {/* Card content */}
                  <div className="group glass-card glass-card-hover p-3 flex-1 mb-2 flex items-center gap-3">
                    {/* Pass/Fail Icon */}
                    {entry.pass ? (
                      <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[#ef4444] shrink-0" />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-[#f5f5f7] truncate">{entry.modelName}</span>
                        <span className="text-[10px] text-[#55556a]">on</span>
                        <span className="text-xs text-[#8b8b9e] truncate">{entry.benchmarkName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#55556a]">
                        <Clock className="h-3 w-3" />
                        <span title={formatAbsoluteTime(entry.timestamp)}>{formatRelativeTime(entry.timestamp)}</span>
                        <span>•</span>
                        <span className="font-[family-name:var(--font-geist-mono)]">{entry.numCorrect}/{entry.numTotal} correct</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="text-sm font-bold font-[family-name:var(--font-geist-mono)] tabular-nums" style={{ color: scoreColor }}>
                        {entry.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
