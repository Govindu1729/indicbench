"use client";

import { motion } from "framer-motion";
import { Crown, Star, Shield, Circle } from "lucide-react";

interface ModelTierBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function ModelTierBadge({ score, size = "sm" }: ModelTierBadgeProps) {
  const tier = score >= 85 ? "S" : score >= 75 ? "A" : score >= 65 ? "B" : "C";
  const config = {
    S: { icon: Crown, color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", label: "Elite" },
    A: { icon: Star, color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", label: "Strong" },
    B: { icon: Shield, color: "#d97706", bg: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.3)", label: "Capable" },
    C: { icon: Circle, color: "#8b8b9e", bg: "rgba(139,139,158,0.08)", border: "rgba(139,139,158,0.2)", label: "Developing" },
  }[tier];

  const Icon = config.icon;
  const isSm = size === "sm";

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="inline-flex items-center gap-1 rounded-full font-medium tier-badge-shimmer"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding: isSm ? "2px 8px" : "4px 12px",
        fontSize: isSm ? "10px" : "12px",
      }}
      title={`${config.label} tier (${tier})`}
    >
      <Icon className={isSm ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {tier}
    </motion.span>
  );
}
