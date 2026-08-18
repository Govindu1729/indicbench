"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface RingConfig {
  label: string;
  value: number; // 0-100
  color: string;
  glowColor: string;
}

const RINGS: RingConfig[] = [
  { label: "Accuracy", value: 86, color: "#f59e0b", glowColor: "rgba(245,158,11,0.3)" },
  { label: "F1 Score", value: 82, color: "#10b981", glowColor: "rgba(16,185,129,0.3)" },
  { label: "Latency Score", value: 74, color: "#a78bfa", glowColor: "rgba(167,139,250,0.3)" },
];

const OVERALL_SCORE = 81;

function AnimatedRing({
  ring,
  index,
  animate,
}: {
  ring: RingConfig;
  index: number;
  animate: boolean;
}) {
  const size = 220 - index * 50;
  const strokeWidth = 10 - index * 1.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!animate) {
      progressRef.current = 0;
      return;
    }
    let startTime: number | null = null;
    const duration = 1800;
    const delay = index * 200;

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease out quart
        const eased = 1 - Math.pow(1 - t, 4);
        progressRef.current = eased * ring.value;
        setProgress(progressRef.current);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timeout);
  }, [animate, ring.value, index]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-90"
      style={{ zIndex: 3 - index }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      {/* Animated arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={ring.color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${ring.glowColor})`,
          transition: "stroke-dashoffset 0.05s ease",
        }}
      />
    </svg>
  );
}

function AnimatedCenterScore({ animate }: { animate: boolean }) {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) {
      countRef.current = 0;
      return;
    }
    let startTime: number | null = null;
    const duration = 2200;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const t = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      countRef.current = Math.round(eased * OVERALL_SCORE);
      setCount(countRef.current);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [animate]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
      <div className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
        {count}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#55556a] mt-1">
        Overall
      </div>
    </div>
  );
}

export function ScoreRingAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px]"
      >
        {RINGS.map((ring, i) => (
          <AnimatedRing
            key={ring.label}
            ring={ring}
            index={i}
            animate={isInView}
          />
        ))}
        <AnimatedCenterScore animate={isInView} />
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {RINGS.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: ring.color,
                boxShadow: `0 0 8px ${ring.glowColor}`,
              }}
            />
            <span className="text-xs text-[#8b8b9e]">{ring.label}</span>
            <span className="text-xs font-semibold text-[#f5f5f7] font-[family-name:var(--font-geist-mono)]">
              {ring.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
