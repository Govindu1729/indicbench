"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Database,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { LeaderboardResponse, BenchmarksResponse, ModelsResponse } from "@/lib/api";
import { SectionNumber } from "@/components/section-number";

/* ===== localStorage for export tracking ===== */
const EXPORT_KEY = "indicbench-export-stats";

interface ExportStats {
  leaderboardCsv: { count: number; lastExport: string | null };
  benchmarksJson: { count: number; lastExport: string | null };
  comparisonHtml: { count: number; lastExport: string | null };
  fullDataset: { count: number; lastExport: string | null };
}

const DEFAULT_STATS: ExportStats = {
  leaderboardCsv: { count: 0, lastExport: null },
  benchmarksJson: { count: 0, lastExport: null },
  comparisonHtml: { count: 0, lastExport: null },
  fullDataset: { count: 0, lastExport: null },
};

function getExportStats(): ExportStats {
  try {
    if (typeof window === "undefined") return DEFAULT_STATS;
    const raw = localStorage.getItem(EXPORT_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function saveExportStats(stats: ExportStats): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(EXPORT_KEY, JSON.stringify(stats));
  } catch {
    // noop
  }
}

interface DataExportCenterProps {
  leaderboardData: LeaderboardResponse | null;
  benchmarksData: BenchmarksResponse | null;
  modelsData: ModelsResponse | null;
  isLoading: boolean;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DataExportCenter({
  leaderboardData,
  benchmarksData,
  modelsData,
  isLoading,
}: DataExportCenterProps) {
  const [exportStats, setExportStats] = useState<ExportStats>(DEFAULT_STATS);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    setExportStats(getExportStats());
  }, []);

  const recordExport = useCallback((key: keyof ExportStats) => {
    setExportStats((prev) => {
      const updated = {
        ...prev,
        [key]: {
          count: prev[key].count + 1,
          lastExport: new Date().toISOString(),
        },
      };
      saveExportStats(updated);
      return updated;
    });
  }, []);

  /* ===== Export: Leaderboard CSV ===== */
  const handleExportCsv = useCallback(async () => {
    setExporting("csv");
    try {
      const res = await fetch("/api/export-leaderboard");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indicbench-leaderboard.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordExport("leaderboardCsv");
      toast.success("Leaderboard CSV downloaded!");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(null);
    }
  }, [recordExport]);

  /* ===== Export: Benchmarks JSON ===== */
  const handleExportJson = useCallback(() => {
    if (!benchmarksData) return;
    setExporting("json");
    try {
      const json = JSON.stringify(benchmarksData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indicbench-benchmarks.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordExport("benchmarksJson");
      toast.success("Benchmarks JSON downloaded!");
    } catch {
      toast.error("Failed to export JSON");
    } finally {
      setExporting(null);
    }
  }, [benchmarksData, recordExport]);

  /* ===== Export: Model Comparison HTML ===== */
  const handleExportHtml = useCallback(() => {
    if (!modelsData) return;
    setExporting("html");
    try {
      const models = modelsData.models.slice(0, 10);
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IndicBench — Model Comparison</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #0a0a0f; color: #f5f5f7; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.08); text-align: left; font-size: 0.8rem; }
    th { background: rgba(255,255,255,0.04); font-weight: 600; }
    .score { font-family: monospace; font-weight: 700; }
    .high { color: #10b981; } .mid { color: #f59e0b; } .low { color: #f97316; }
  </style>
</head>
<body>
  <h1>IndicBench Model Comparison</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Model</th><th>Provider</th><th>Overall</th>
        ${Object.keys(models[0]?.categoryScores ?? {}).map((k) => `<th>${k}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${models
        .map(
          (m, i) => `<tr>
        <td>${i + 1}</td>
        <td>${m.name}</td>
        <td>${m.provider}</td>
        <td class="score ${m.overallScore >= 80 ? "high" : m.overallScore >= 60 ? "mid" : "low"}">${m.overallScore?.toFixed(1) ?? "—"}</td>
        ${Object.values(m.categoryScores ?? {})
          .map(
            (s) =>
              `<td class="score ${s >= 80 ? "high" : s >= 60 ? "mid" : "low"}">${s.toFixed(1)}</td>`
          )
          .join("")}
      </tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indicbench-comparison.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordExport("comparisonHtml");
      toast.success("Comparison HTML downloaded!");
    } catch {
      toast.error("Failed to export HTML");
    } finally {
      setExporting(null);
    }
  }, [modelsData, recordExport]);

  /* ===== Export: Full Dataset JSON ===== */
  const handleExportFull = useCallback(() => {
    if (!leaderboardData || !benchmarksData || !modelsData) return;
    setExporting("full");
    try {
      const full = {
        exportedAt: new Date().toISOString(),
        leaderboard: leaderboardData,
        benchmarks: benchmarksData,
        models: modelsData,
      };
      const json = JSON.stringify(full, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indicbench-full-dataset.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordExport("fullDataset");
      toast.success("Full dataset downloaded!");
    } catch {
      toast.error("Failed to export dataset");
    } finally {
      setExporting(null);
    }
  }, [leaderboardData, benchmarksData, modelsData, recordExport]);

  const exportOptions = [
    {
      key: "csv" as const,
      title: "Leaderboard CSV",
      desc: "Rank, model, provider, overall & category scores",
      icon: FileSpreadsheet,
      color: "#10b981",
      count: exportStats.leaderboardCsv.count,
      lastExport: exportStats.leaderboardCsv.lastExport,
      onExport: handleExportCsv,
      isExporting: exporting === "csv",
      preview: leaderboardData
        ? `${leaderboardData.overallRanking.length} models × 5 categories`
        : "—",
    },
    {
      key: "json" as const,
      title: "Benchmarks JSON",
      desc: "All benchmarks with model rankings and metadata",
      icon: FileJson,
      color: "#f59e0b",
      count: exportStats.benchmarksJson.count,
      lastExport: exportStats.benchmarksJson.lastExport,
      onExport: handleExportJson,
      isExporting: exporting === "json",
      preview: benchmarksData
        ? `${benchmarksData.categories.reduce((s, c) => s + c.benchmarks.length, 0)} benchmarks`
        : "—",
    },
    {
      key: "html" as const,
      title: "Model Comparison",
      desc: "Side-by-side HTML table of all models & scores",
      icon: FileText,
      color: "#f97316",
      count: exportStats.comparisonHtml.count,
      lastExport: exportStats.comparisonHtml.lastExport,
      onExport: handleExportHtml,
      isExporting: exporting === "html",
      preview: modelsData
        ? `${modelsData.models.length} models compared`
        : "—",
    },
    {
      key: "full" as const,
      title: "Full Dataset",
      desc: "Complete leaderboard + benchmarks + models export",
      icon: Database,
      color: "#0d9488",
      count: exportStats.fullDataset.count,
      lastExport: exportStats.fullDataset.lastExport,
      onExport: handleExportFull,
      isExporting: exporting === "full",
      preview: "All data combined",
    },
  ];

  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="12" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Data Export Center
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Download and export IndicBench data in multiple formats
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {exportOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.div
                key={opt.key}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="glass-card p-5 !rounded-xl h-full flex flex-col group hover:border-[rgba(255,255,255,0.12)] transition-all">
                  {/* Icon */}
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                    style={{
                      backgroundColor: `${opt.color}12`,
                      color: opt.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#f5f5f7] mb-1">
                    {opt.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] text-[#8b8b9e] leading-relaxed mb-3">
                    {opt.desc}
                  </p>

                  {/* Preview */}
                  <div className="text-[10px] text-[#55556a] font-[family-name:var(--font-geist-mono)] mb-3">
                    {opt.preview}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[10px] text-[#55556a] mb-4">
                    {opt.count > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-2.5 w-2.5" />
                        {opt.count}×
                      </span>
                    )}
                    {opt.lastExport && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTimestamp(opt.lastExport)}
                      </span>
                    )}
                  </div>

                  {/* Export button */}
                  <button
                    onClick={opt.onExport}
                    disabled={isLoading || opt.isExporting}
                    className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border transition-all disabled:opacity-40"
                    style={{
                      borderColor: `${opt.color}30`,
                      backgroundColor: `${opt.color}08`,
                      color: opt.color,
                    }}
                  >
                    {opt.isExporting ? (
                      <>
                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Exporting…
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        Export
                        {opt.count > 0 && (
                          <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] text-[#8b8b9e]">
                            {opt.count}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Total exports badge */}
        {Object.values(exportStats).some((s) => s.count > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-6"
          >
            <span className="inline-flex items-center gap-2 glass-card px-4 py-2 text-[11px] text-[#8b8b9e]">
              <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
              Total exports:{" "}
              <span className="text-[#f5f5f7] font-[family-name:var(--font-geist-mono)]">
                {Object.values(exportStats).reduce((s, v) => s + v.count, 0)}
              </span>
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
