"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, TrendingUp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#f59e0b]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#10b981]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#a78bfa]/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Glitch icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full mb-6"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%)",
          }}
        >
          <Search className="h-9 w-9 text-[#f59e0b]" />
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-7xl font-bold font-[family-name:var(--font-playfair)] mb-2"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-semibold text-[#f5f5f7] mb-2"
        >
          Benchmark Not Found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#8b8b9e] mb-8"
        >
          This benchmark doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="glow-button-saffron inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/#leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[#f5f5f7] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] transition-all"
          >
            <TrendingUp className="h-4 w-4 text-[#10b981]" />
            View Leaderboard
          </Link>
        </motion.div>

        {/* Footer text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-xs text-[#55556a]"
        >
          IndicBench © 2026 · Built at IIT Gandhinagar
        </motion.div>
      </motion.div>
    </div>
  );
}
