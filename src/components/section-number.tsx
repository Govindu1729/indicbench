"use client";

import { motion } from "framer-motion";

interface SectionNumberProps {
  number: string;
  className?: string;
}

export function SectionNumber({ number, className = "" }: SectionNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`absolute -left-2 -top-4 text-[6rem] md:text-[8rem] font-[family-name:var(--font-geist-mono)] font-bold leading-none select-none pointer-events-none text-[#ffffff08] ${className}`}
      aria-hidden="true"
    >
      {number}
    </motion.span>
  );
}
