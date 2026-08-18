"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, TrendingUp } from "lucide-react";

const STATS = [
  {
    label: "Top Model",
    value: "Claude Opus 4",
    detail: "86.5",
    icon: "🏆",
  },
  {
    label: "Hardest Domain",
    value: "Vernacular",
    detail: "62.3",
    icon: "🔥",
  },
  {
    label: "Fastest",
    value: "Gemma 3",
    detail: "245ms",
    icon: "⚡",
  },
];

const DISMISS_KEY = "indicbench-quick-stats-dismissed";

function useLocalStorageDismissed(key: string): [boolean, () => void, () => void] {
  const [locallyDismissed, setLocallyDismissed] = useState(false);

  const storedDismissed = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem(key) === "true",
    () => false, // server: not dismissed by default
  );

  const isDismissed = storedDismissed || locallyDismissed;

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(key, "true");
    } catch {
      // ignore
    }
    setLocallyDismissed(true);
  }, [key]);

  const restore = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setLocallyDismissed(false);
  }, [key]);

  return [isDismissed, dismiss, restore];
}

export function QuickStatsWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, handleDismiss, handleRestore] = useLocalStorageDismissed(DISMISS_KEY);

  // Auto-rotate stats every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % STATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // If dismissed, show a small icon to restore
  if (dismissed) {
    return (
      <div className="floating-widget hidden lg:block">
        <button
          onClick={handleRestore}
          className="w-8 h-8 rounded-full glass-card glass-card-hover flex items-center justify-center text-[#55556a] hover:text-[#f59e0b] transition-colors"
          aria-label="Show quick stats"
        >
          <TrendingUp className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // Minimized state: show small icon
  if (minimized) {
    return (
      <div className="floating-widget hidden lg:block">
        <button
          onClick={() => setMinimized(false)}
          className="w-10 h-10 rounded-xl glass-card glass-card-hover flex items-center justify-center text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
          aria-label="Expand quick stats"
        >
          <span className="text-sm">{STATS[currentIndex].icon}</span>
        </button>
      </div>
    );
  }

  const currentStat = STATS[currentIndex];

  return (
    <div className="floating-widget hidden lg:block">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-3 min-w-[180px] relative group"
      >
        {/* Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setMinimized(true)}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[#55556a] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.08)] transition-all"
            aria-label="Minimize"
          >
            <Minimize2 className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={handleDismiss}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[#55556a] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.08)] transition-all"
            aria-label="Dismiss"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* Rotating stat */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-base shrink-0">{currentStat.icon}</span>
          <div className="min-w-0">
            <div className="text-[10px] text-[#55556a] uppercase tracking-wider">
              {currentStat.label}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs font-semibold text-[#f5f5f7] truncate">
                  {currentStat.value}
                </span>
                <span className="text-[10px] font-bold font-[family-name:var(--font-geist-mono)] tabular-nums text-[#f59e0b]">
                  ({currentStat.detail})
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-1 mt-2">
          {STATS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-4 bg-[#f59e0b]"
                  : "w-1 bg-[rgba(255,255,255,0.12)]"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
