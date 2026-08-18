"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ProviderBadge, ScoreGauge } from "@/components/shared-ui";
import type { ModelsResponse } from "@/lib/api";

interface ModelCarouselProps {
  data: ModelsResponse | null;
  isLoading: boolean;
  onModelClick?: (modelId: string, modelName: string) => void;
}

function ModelCard({
  model,
  onClick,
}: {
  model: {
    id: string;
    name: string;
    provider: string;
    overallScore: number;
    rank: number;
  };
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card glass-card-hover glass-card-shine shrink-0 w-[200px] md:w-[220px] p-4 cursor-pointer group"
    >
      {/* Rank badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold font-[family-name:var(--font-geist-mono)] text-[#55556a] uppercase tracking-wider">
          #{model.rank}
        </span>
        <ProviderBadge provider={model.provider} />
      </div>

      {/* Model name */}
      <h3 className="text-sm font-semibold text-[#f5f5f7] mb-3 truncate group-hover:text-[#f59e0b] transition-colors">
        {model.name}
      </h3>

      {/* Score gauge + value */}
      <div className="flex items-center gap-3">
        <ScoreGauge score={model.overallScore} size={40} strokeWidth={3} />
        <div>
          <div className="text-xl font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f5f5f7]">
            {model.overallScore.toFixed(1)}
          </div>
          <div className="text-[9px] text-[#55556a] uppercase tracking-wider">
            Overall
          </div>
        </div>
      </div>

      {/* Mini bar */}
      <div className="mt-3 h-1 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${model.overallScore}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #f59e0b, #10b981)`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function ModelCarousel({ data, isLoading, onModelClick }: ModelCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionRef = useRef(0);

  // Prepare model data - fallback to empty array
  const models = data?.models ?? [];

  // Create duplicated list for infinite scroll
  const allItems = [...models, ...models];

  const startScroll = useCallback(() => {
    if (!scrollRef.current || allItems.length === 0) return;

    const scrollEl = scrollRef.current;
    // Half the width = one set of cards
    const halfWidth = scrollEl.scrollWidth / 2;
    const speed = 0.5; // pixels per frame

    const tick = () => {
      if (!isPaused) {
        positionRef.current += speed;
        if (positionRef.current >= halfWidth) {
          positionRef.current -= halfWidth;
        }
        scrollEl.scrollLeft = positionRef.current;
      }
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
  }, [allItems.length, isPaused]);

  useEffect(() => {
    if (allItems.length === 0) return;
    startScroll();
    return () => cancelAnimationFrame(animationRef.current);
  }, [startScroll, allItems.length]);

  // Placeholder while loading
  if (isLoading) {
    return (
      <div className="py-8 overflow-hidden">
        <div className="flex gap-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[200px] md:w-[220px] h-[160px] rounded-xl bg-[rgba(255,255,255,0.03)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (models.length === 0) return null;

  return (
    <div className="relative py-8 group/carousel">
      {/* Left fade mask */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {allItems.map((model, i) => (
          <ModelCard
            key={`${model.id}-${i}`}
            model={model}
            onClick={() => onModelClick?.(model.id, model.name)}
          />
        ))}
      </div>

      {/* Right fade mask */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
