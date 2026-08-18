"use client";

import { motion } from "framer-motion";

const TICKER_ITEMS = [
  { emoji: "\u{1F525}", text: "170 Evaluations Completed", accent: true },
  { emoji: "\u26A1", text: "Claude Opus 4 leads with 86.5 avg", accent: false },
  { emoji: "\u{1F1EE}\u{1F1F3}", text: "5 Indian Domains Covered", accent: true },
  { emoji: "\u{1F4CA}", text: "3,535+ Questions Tested", accent: false },
  { emoji: "\u{1F3AF}", text: "10 Models Benchmarked", accent: false },
  { emoji: "\u{1F4D6}", text: "17 Unique Benchmark Suites", accent: true },
  { emoji: "\u{1F916}", text: "GPT-4o scores 85.2 overall", accent: false },
  { emoji: "\u{1F30F}", text: "Vernacular AI: 8 languages tested", accent: true },
];

function TickerItem({ item, index }: { item: (typeof TICKER_ITEMS)[0]; index: number }) {
  return (
    <div className="flex items-center gap-2 shrink-0 px-6 whitespace-nowrap">
      <span className="text-base">{item.emoji}</span>
      <span
        className={`text-sm font-medium ${
          item.accent
            ? "bg-gradient-to-r from-[#f59e0b] to-[#10b981] bg-clip-text text-transparent"
            : "text-[#c8c8d4]"
        }`}
      >
        {item.text}
      </span>
      {/* Separator dot */}
      <span className="ml-6 w-1 h-1 rounded-full bg-[rgba(255,255,255,0.15)]" />
    </div>
  );
}

export function StatsTicker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border-y border-[rgba(255,255,255,0.06)]" />

      {/* Left fade mask */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
      {/* Right fade mask */}
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />

      {/* Ticker track - duplicated for infinite scroll */}
      <div className="stats-ticker-track py-2.5 relative z-[1]">
        {TICKER_ITEMS.map((item, i) => (
          <TickerItem key={`a-${i}`} item={item} index={i} />
        ))}
        {TICKER_ITEMS.map((item, i) => (
          <TickerItem key={`b-${i}`} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
