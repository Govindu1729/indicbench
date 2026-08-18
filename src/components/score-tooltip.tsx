"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Target, Clock, DollarSign, BarChart3 } from "lucide-react";

interface ScoreTooltipProps {
  score: number;
  accuracy?: number | null;
  f1Score?: number | null;
  latencyMs?: number | null;
  costUsd?: number | null;
  children: React.ReactNode;
}

export function ScoreTooltip({
  score,
  accuracy,
  f1Score,
  latencyMs,
  costUsd,
  children,
}: ScoreTooltipProps) {
  const scoreColor =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  const details = [
    { icon: Target, label: "Score", value: score.toFixed(1), color: scoreColor },
    ...(accuracy != null
      ? [{ icon: BarChart3, label: "Accuracy", value: `${(accuracy * 100).toFixed(1)}%`, color: "#10b981" }]
      : []),
    ...(f1Score != null
      ? [{ icon: BarChart3, label: "F1 Score", value: f1Score.toFixed(3), color: "#60a5fa" }]
      : []),
    ...(latencyMs != null
      ? [{ icon: Clock, label: "Latency", value: `${latencyMs.toFixed(0)}ms`, color: "#a78bfa" }]
      : []),
    ...(costUsd != null
      ? [{ icon: DollarSign, label: "Cost", value: `$${costUsd.toFixed(4)}`, color: "#f59e0b" }]
      : []),
  ];

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="glass-card !bg-[#111118] !border-[rgba(255,255,255,0.1)] p-3 min-w-[160px] shadow-xl"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <div className="text-[10px] uppercase tracking-wider text-[#55556a] font-semibold mb-1">
              Score Breakdown
            </div>
            {details.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <Icon className="h-3 w-3 shrink-0" style={{ color: item.color }} />
                  <span className="text-[10px] text-[#8b8b9e] flex-1">{item.label}</span>
                  <span
                    className="text-[11px] font-bold font-[family-name:var(--font-geist-mono)] tabular-nums"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </TooltipContent>
    </Tooltip>
  );
}
