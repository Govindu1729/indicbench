"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left scroll-progress-glow"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #f59e0b, #10b981, #f59e0b)",
      }}
    />
  );
}
