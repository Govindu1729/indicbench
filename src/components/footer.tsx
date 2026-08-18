"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Mail,
  BookOpen,
  Heart,
  Terminal,
  ArrowUp,
  Database,
  Cpu,
  FileCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { AnimatedCounter } from "@/components/shared-ui";

const TECH_STACK = [
  "Next.js",
  "Prisma",
  "Recharts",
  "Framer Motion",
  "Tailwind CSS",
];

const STATS = [
  { icon: Cpu, label: "Models", value: 10, color: "#f59e0b" },
  { icon: Database, label: "Benchmarks", value: 17, color: "#10b981" },
  { icon: FileCheck, label: "Evaluations", value: 170, color: "#60a5fa" },
  { icon: HelpCircle, label: "Questions", value: 4250, color: "#a78bfa" },
];

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Leaderboard", href: "#leaderboard" },
      { label: "Benchmarks", href: "#benchmarks" },
      { label: "Evaluate", href: "#evaluate" },
      { label: "About", href: "#about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Methodology", href: "#about" },
      { label: "API Docs", href: "#" },
      { label: "Datasets", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/indicbench" },
      { label: "Contact", href: "mailto:indicbench@iitgn.ac.in" },
      { label: "IIT Gandhinagar", href: "#" },
      { label: "IndiaAI Mission", href: "#" },
    ],
  },
];

function CollapsibleSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 text-sm font-medium text-[#f5f5f7] hover:text-[#f59e0b] transition-colors"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-[#55556a] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col gap-1.5 pb-3 pl-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-[#8b8b9e] hover:text-[#f59e0b] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-auto relative">
      {/* Animated gradient mesh background */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 40% at 40% 70%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 70% 30%, rgba(167,139,250,0.1) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 40% at 60% 80%, rgba(167,139,250,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 30% 20%, rgba(245,158,11,0.1) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />
      {/* Enhanced SVG wave/gradient divider */}
      <div className="footer-wave-v2">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-grad-v2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="10%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="30%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="90%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Multiple wave layers for depth */}
          <path d="M0 24 Q120 8 240 24 T480 24 T720 24 T960 24 T1200 24 T1440 24 V48 H0 Z" fill="url(#wave-grad-v2)" opacity="0.6" />
          <path d="M0 28 Q180 12 360 28 T720 28 T1080 28 T1440 28 V48 H0 Z" fill="url(#wave-grad-v2)" opacity="0.3" />
          <path d="M0 32 Q200 20 400 32 T800 32 T1200 32 T1440 32 V48 H0 Z" fill="url(#wave-grad-v2)" opacity="0.15" />
        </svg>
      </div>

      <div className="glass-card !rounded-none border-x-0 border-b-0 footer-animated-gradient footer-float-element">
        <div className="container mx-auto px-4">
          {/* Stats Summary Row */}
          <div className="py-5 border-b border-[rgba(255,255,255,0.04)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${stat.color}10`,
                        border: `1px solid ${stat.color}20`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#f5f5f7]">
                        <AnimatedCounter target={stat.value} />
                      </div>
                      <div className="text-[10px] text-[#55556a] uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation grid (desktop) / collapsible (mobile) */}
          <div className="py-6 border-b border-[rgba(255,255,255,0.04)]">
            {/* Desktop: 3-column nav */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8b8b9e] mb-3">
                    {section.title}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {section.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-[#55556a] hover:text-[#f59e0b] transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile: collapsible sections */}
            <div className="md:hidden">
              {FOOTER_SECTIONS.map((section) => (
                <CollapsibleSection key={section.title} title={section.title} links={section.links} />
              ))}
            </div>
          </div>

          {/* Upper section: brand + social links */}
          <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-[family-name:var(--font-playfair)] font-bold text-gradient-saffron">
                IndicBench
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] score-badge-glow badge-shine">
                v2.1
              </span>
              {/* Made in India badge */}
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)] text-[#10b981] glow-pulse-emerald">
                Made in India 🇮🇳
              </span>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://github.com/indicbench"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#55556a] hover:text-[#f59e0b] transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-1.5 text-xs text-[#55556a] hover:text-[#f59e0b] transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Methodology
              </a>
              <a
                href="mailto:indicbench@iitgn.ac.in"
                className="inline-flex items-center gap-1.5 text-xs text-[#55556a] hover:text-[#f59e0b] transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Contact
              </a>
            </div>
          </div>

          {/* Social proof */}
          <div className="py-3 border-t border-[rgba(255,255,255,0.04)] text-center">
            <p className="text-[11px] text-[#55556a] italic">
              Trusted by researchers at{" "}
              <span className="text-[#8b8b9e] font-medium not-italic">IIT Delhi</span>,{" "}
              <span className="text-[#8b8b9e] font-medium not-italic">IIT Bombay</span>,{" "}
              <span className="text-[#8b8b9e] font-medium not-italic">IISc Bangalore</span>,{" "}
              <span className="text-[#8b8b9e] font-medium not-italic">IIIT Hyderabad</span>
              {" "}and 15+ Indian institutions
            </p>
          </div>

          {/* Tech stack badges */}
          <div className="py-3 border-t border-[rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] text-[#55556a] mr-1">Built with</span>
              {TECH_STACK.map((tech) => (
                <span key={tech} className="tech-badge">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom section: credits + shortcuts hint */}
          <div className="border-t border-[rgba(255,255,255,0.04)] py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#55556a]">
              <span>&copy; 2026</span>
              <span>&middot;</span>
              <span>
                Built with <Heart className="inline h-3 w-3 text-[#ef4444] mx-0.5" /> at <span className="font-medium text-[#8b8b9e]">IIT Gandhinagar</span>
              </span>
              <span>&middot;</span>
              <span>For the <span className="font-medium text-[#8b8b9e]">IndiaAI Mission</span></span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-[#55556a]">
              <span className="inline-flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                <kbd className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] font-[family-name:var(--font-geist-mono)]">⌘K</kbd>
                to search
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                All systems operational
              </span>
            </div>

            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-[#55556a] hover:text-[#f59e0b] hover:bg-[rgba(245,158,11,0.08)] border border-transparent hover:border-[rgba(245,158,11,0.15)] transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="h-3 w-3" />
              Back to top
            </button>
          </div>
        </div>

        {/* Animated gradient bottom edge */}
        <div className="h-0.5 w-full footer-bottom-gradient" />
      </div>
    </footer>
  );
}
