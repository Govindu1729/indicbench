"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const BANNER_KEY = "indicbench-announcement-dismissed-v2";
const BANNER_TEXT =
  "IndicBench v2.0 — Now with 17 benchmarks across 5 critical Indian domains. Built for the IndiaAI Mission.";

export function AnnouncementBanner() {
  const [locallyDismissed, setLocallyDismissed] = useState(false);

  // Use useSyncExternalStore to read localStorage without setState-in-effect
  const storedDismissed = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem(BANNER_KEY) === "true",
    () => true, // server snapshot
  );

  const isDismissed = storedDismissed || locallyDismissed;

  const handleDismiss = () => {
    localStorage.setItem(BANNER_KEY, "true");
    setLocallyDismissed(true);
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-[60] w-full"
        >
          {/* Indian flag gradient top border */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#f59e0b] via-white to-[#10b981]" />

          <div className="relative flex items-center justify-center h-8 overflow-hidden text-sm font-medium text-white bg-gradient-to-r from-[#f59e0b]/90 via-[#d97706]/90 to-[#10b981]/90 backdrop-blur-sm">
            {/* Subtle shimmer overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />
            </div>

            {/* Marquee text */}
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <span className="relative z-10 marquee-text inline-flex items-center gap-6">
                <span>🚀 {BANNER_TEXT}</span>
                <span className="text-white/40">•</span>
                <span>🚀 {BANNER_TEXT}</span>
                <span className="text-white/40">•</span>
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="relative z-10 ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
