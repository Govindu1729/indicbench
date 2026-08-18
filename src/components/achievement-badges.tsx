"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Zap,
  Compass,
  Search,
  Download,
  Flame,
  Lock,
  Check,
} from "lucide-react";
import { SectionNumber } from "@/components/section-number";

/* ===== Achievement Definitions ===== */
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  check: (state: Record<string, number>) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_eval",
    title: "First Evaluation",
    description: "Run your first evaluation",
    icon: Zap,
    color: "#f59e0b",
    check: (s) => (s.evaluations ?? 0) >= 1,
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete evaluation in under 5s",
    icon: Flame,
    color: "#ef4444",
    check: (s) => (s.fastEval ?? 0) >= 1,
  },
  {
    id: "model_explorer",
    title: "Model Explorer",
    description: "View 5+ model profiles",
    icon: Compass,
    color: "#10b981",
    check: (s) => (s.modelViews ?? 0) >= 5,
  },
  {
    id: "benchmark_hunter",
    title: "Benchmark Hunter",
    description: "View all 17 benchmarks",
    icon: Search,
    color: "#60a5fa",
    check: (s) => (s.benchmarkViews ?? 0) >= 17,
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    description: "Export leaderboard data",
    icon: Download,
    color: "#a78bfa",
    check: (s) => (s.exports ?? 0) >= 1,
  },
];

const STORAGE_KEY = "indicbench_achievements_state";

/* ===== Helper: read/write localStorage ===== */
function readState(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(state: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/* ===== Export for external components to track progress ===== */
export function trackAchievementProgress(key: string, increment = 1) {
  const state = readState();
  state[key] = (state[key] ?? 0) + increment;
  writeState(state);
}

/* ===== Achievement Badge Card ===== */
function BadgeCard({
  achievement,
  unlocked,
  delay,
  onUnlock,
}: {
  achievement: Achievement;
  unlocked: boolean;
  delay: number;
  onUnlock: (id: string) => void;
}) {
  const [justUnlocked, setJustUnlocked] = useState(false);
  const Icon = achievement.icon;

  useEffect(() => {
    if (unlocked) {
      const timer = setTimeout(() => {
        setJustUnlocked(true);
        onUnlock(achievement.id);
      }, delay * 1000 + 300);
      return () => clearTimeout(timer);
    }
  }, [unlocked, delay, achievement.id, onUnlock]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* Glow effect when unlocking */}
      <AnimatePresence>
        {justUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle, ${achievement.color}30 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      <div
        className={`relative z-10 glass-card glass-card-shine p-5 text-center transition-all duration-300 group-hover:scale-[1.03] ${
          unlocked
            ? ""
            : "opacity-50 grayscale"
        }`}
        style={
          unlocked
            ? {
                borderColor: `${achievement.color}30`,
                boxShadow: justUnlocked ? `0 0 24px ${achievement.color}25` : "none",
              }
            : {}
        }
      >
        {/* Icon */}
        <div
          className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300"
          style={{
            backgroundColor: unlocked ? `${achievement.color}18` : "rgba(255,255,255,0.04)",
            color: unlocked ? achievement.color : "#55556a",
            boxShadow: unlocked ? `0 0 12px ${achievement.color}15` : "none",
          }}
        >
          {unlocked ? (
            <motion.div
              initial={{ rotate: -30, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: delay * 0.5 }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>

        {/* Title */}
        <h4
          className="text-sm font-semibold mb-1 font-[family-name:var(--font-playfair)]"
          style={{ color: unlocked ? "#f5f5f7" : "#55556a" }}
        >
          {achievement.title}
        </h4>

        {/* Description */}
        <p className="text-[11px] text-[#55556a] leading-relaxed mb-2">
          {achievement.description}
        </p>

        {/* Status indicator */}
        {unlocked ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium"
            style={{
              backgroundColor: `${achievement.color}15`,
              color: achievement.color,
              border: `1px solid ${achievement.color}25`,
            }}
          >
            <Check className="h-2.5 w-2.5" />
            Unlocked
          </motion.div>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium bg-[rgba(255,255,255,0.04)] text-[#55556a] border border-[rgba(255,255,255,0.06)]">
            <Lock className="h-2.5 w-2.5" />
            Locked
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ===== Main Component ===== */
export function AchievementBadges() {
  const [progressState, setProgressState] = useState<Record<string, number>>({});
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set());

  // Load from localStorage
  useEffect(() => {
    const state = readState();
    setProgressState(state);
  }, []);

  // Compute unlocked badges
  const computedUnlocked = useMemo(() => {
    const set = new Set<string>();
    ACHIEVEMENTS.forEach((a) => {
      if (a.check(progressState)) set.add(a.id);
    });
    return set;
  }, [progressState]);

  useEffect(() => {
    setUnlockedIds(computedUnlocked);
  }, [computedUnlocked]);

  const handleBadgeUnlock = useCallback((id: string) => {
    setNewlyUnlocked((prev) => new Set(prev).add(id));
  }, []);

  // Seed some progress for demo (if first visit)
  useEffect(() => {
    const state = readState();
    if (Object.keys(state).length === 0) {
      // Give first-time visitors some starter progress
      const seeded = {
        evaluations: 1,
        fastEval: 0,
        modelViews: 3,
        benchmarkViews: 8,
        exports: 0,
      };
      writeState(seeded);
      setProgressState(seeded);
    }
  }, []);

  const totalUnlocked = unlockedIds.size;
  const totalBadges = ACHIEVEMENTS.length;

  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="relative mb-2 text-center">
          <SectionNumber number="09" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            Achievement Badges
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center text-[#8b8b9e]"
        >
          Earn badges as you explore the platform — {totalUnlocked}/{totalBadges} unlocked
        </motion.p>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalUnlocked / totalBadges) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #f59e0b, #10b981)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-[#55556a]">
            <span>{totalUnlocked} unlocked</span>
            <span>{totalBadges - totalUnlocked} remaining</span>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {ACHIEVEMENTS.map((achievement, idx) => (
            <BadgeCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedIds.has(achievement.id)}
              delay={idx * 0.1}
              onUnlock={handleBadgeUnlock}
            />
          ))}
        </div>

        {/* New unlock notification */}
        <AnimatePresence>
          {newlyUnlocked.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 glass-card border border-[rgba(245,158,11,0.2)]">
                <Award className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-xs font-medium text-[#f5f5f7]">
                  {newlyUnlocked.size} badge{newlyUnlocked.size > 1 ? "s" : ""} unlocked! Keep exploring to earn more.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
