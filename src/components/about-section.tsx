"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, FlaskConical, Target, Users, FileCheck, Globe, Cpu, Scale } from "lucide-react";
import { SectionNumber } from "@/components/section-number";

const METHODOLOGY_STEPS = [
  {
    step: 1,
    icon: Target,
    title: "Domain Identification",
    desc: "Domain experts identify critical real-world AI tasks for India — legal reasoning, medical diagnosis, financial advisory, vernacular NLU, and educational assessment.",
    color: "#f59e0b",
  },
  {
    step: 2,
    icon: FileCheck,
    title: "Question Curation",
    desc: "Questions are drafted, peer-reviewed, and validated against authoritative sources — Bare Acts for Legal, NMC guidelines for Healthcare, RBI circulars for Finance.",
    color: "#f97316",
  },
  {
    step: 3,
    icon: Scale,
    title: "Answer Key Creation",
    desc: "Every question receives a deterministic or semi-deterministic answer key, ensuring objective, reproducible scoring across all model evaluations.",
    color: "#10b981",
  },
  {
    step: 4,
    icon: Cpu,
    title: "Model Evaluation",
    desc: "Models are evaluated on accuracy, F1 score, latency, and cost. Each evaluation is fully automated and reproducible with published code and prompts.",
    color: "#0d9488",
  },
  {
    step: 5,
    icon: Globe,
    title: "Community Review",
    desc: "Results are published for open review. Domain experts verify edge cases, and the community can flag issues or contribute additional benchmarks.",
    color: "#6366f1",
  },
  {
    step: 6,
    icon: Users,
    title: "Continuous Iteration",
    desc: "Benchmarks are versioned and updated quarterly. New domains, languages, and tasks are added based on India's evolving AI needs and policy landscape.",
    color: "#ec4899",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="relative mb-2 text-center">
          <SectionNumber number="09" />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
          >
            About &amp; Methodology
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          How IndicBench ensures rigorous, India-specific AI evaluation
        </motion.p>

        {/* Glow Line Divider */}
        <div className="glow-line-wide max-w-md mx-auto mb-10" />

        {/* Methodology Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto max-w-3xl mb-12"
        >
          <h3 className="text-base font-semibold mb-6 font-[family-name:var(--font-playfair)] text-[#f5f5f7] text-center">
            Evaluation Methodology
          </h3>
          <div className="relative">
            {/* Central vertical line (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#f59e0b]/30 via-[#10b981]/20 to-transparent" />

            {METHODOLOGY_STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`relative mb-6 md:mb-8 ${
                    isLeft ? "md:pr-[52%]" : "md:pl-[52%]"
                  }`}
                >
                  {/* Step number badge on the center line (desktop) */}
                  <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 z-10">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                      style={{
                        backgroundColor: `${step.color}18`,
                        borderColor: `${step.color}44`,
                        color: step.color,
                      }}
                    >
                      {step.step}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="glass-card glass-surface card-spotlight noise-texture p-4 rounded-xl">
                    {/* Mobile step number */}
                    <div className="flex md:hidden items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${step.color}18`,
                          borderColor: `${step.color}44`,
                          color: step.color,
                        }}
                      >
                        {step.step}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${step.color}12`, color: step.color }}
                      >
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-[#f5f5f7]">{step.title}</h4>
                        <p className="text-xs text-[#8b8b9e] leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Glow Line Divider */}
        <div className="glow-line max-w-xs mx-auto mb-10" />

        <div className="mx-auto max-w-4xl">
          {/* Two-column layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Key methodology points */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {[
                {
                  icon: Target,
                  title: "India-Specific Tasks",
                  desc: "Every benchmark is designed for Indian contexts — IPC sections, RBI regulations, Ayushman Bharat, regional languages, and more.",
                  color: "#f59e0b",
                },
                {
                  icon: FlaskConical,
                  title: "Rigorous Scoring",
                  desc: "Models are evaluated on accuracy, F1 score, latency, and cost. Each benchmark has expert-validated answer keys.",
                  color: "#10b981",
                },
                {
                  icon: BookOpen,
                  title: "Domain Experts",
                  desc: "Benchmarks are curated with input from legal professionals, doctors, financial analysts, and educators across India.",
                  color: "#f97316",
                },
                {
                  icon: Users,
                  title: "Open & Reproducible",
                  desc: "All evaluation code is open source. Anyone can re-run evaluations or contribute new benchmarks to the suite.",
                  color: "#0d9488",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="glass-card glass-surface card-spotlight flex gap-3 p-4 items-start rounded-xl"
                >
                  <div
                    className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}12`, color: item.color }}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-[#f5f5f7]">{item.title}</h3>
                    <p className="text-xs text-[#8b8b9e] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right: FAQ accordion in glass */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="glass-card glass-surface-subtle noise-texture p-5 rounded-xl">
                <h3 className="font-semibold text-sm mb-3 font-[family-name:var(--font-playfair)] text-base text-[#f5f5f7]">FAQ</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="creation" className="border-b border-[rgba(255,255,255,0.06)]">
                    <AccordionTrigger className="dark-accordion-trigger text-sm font-medium text-[#f5f5f7] hover:no-underline">
                      How are benchmarks created?
                    </AccordionTrigger>
                    <AccordionContent className="dark-accordion-content text-sm text-[#8b8b9e] leading-relaxed">
                      Each benchmark begins with domain experts identifying critical
                      real-world tasks. Questions are drafted, peer-reviewed, and
                      validated against authoritative sources (e.g., Bare Acts for
                      Legal, NMC guidelines for Healthcare). Every question has a
                      deterministic or semi-deterministic answer key.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="scoring" className="border-b border-[rgba(255,255,255,0.06)]">
                    <AccordionTrigger className="dark-accordion-trigger text-sm font-medium text-[#f5f5f7] hover:no-underline">
                      Scoring Criteria
                    </AccordionTrigger>
                    <AccordionContent className="dark-accordion-content text-sm text-[#8b8b9e] leading-relaxed">
                      <strong className="text-[#f5f5f7]">Score</strong> — Percentage of correct answers (exact or
                      semantic match). <strong className="text-[#f5f5f7]">Accuracy</strong> — Binary correctness
                      rate. <strong className="text-[#f5f5f7]">F1 Score</strong> — Harmonic mean of precision and
                      recall for partial-credit tasks. <strong className="text-[#f5f5f7]">Latency</strong> —
                      Average inference time per question. <strong className="text-[#f5f5f7]">Cost</strong> —
                      Token-based cost at published API rates.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="india" className="border-b border-[rgba(255,255,255,0.06)]">
                    <AccordionTrigger className="dark-accordion-trigger text-sm font-medium text-[#f5f5f7] hover:no-underline">
                      Why India-specific?
                    </AccordionTrigger>
                    <AccordionContent className="dark-accordion-content text-sm text-[#8b8b9e] leading-relaxed">
                      General benchmarks (MMLU, Hellaswag) underrepresent Indian
                      contexts — regional languages, constitutional law, public health
                      schemes, and financial regulations. IndicBench fills this gap,
                      ensuring AI models serve India&apos;s 1.4 billion people effectively.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="roadmap" className="border-b-0">
                    <AccordionTrigger className="dark-accordion-trigger text-sm font-medium text-[#f5f5f7] hover:no-underline">
                      Future Roadmap
                    </AccordionTrigger>
                    <AccordionContent className="dark-accordion-content text-sm text-[#8b8b9e] leading-relaxed">
                      <ul className="list-disc space-y-1 pl-4">
                        <li>Multi-modal benchmarks (image + text for medical imaging)</li>
                        <li>Expansion to all 22 scheduled languages</li>
                        <li>Agent-based evaluation for complex workflows</li>
                        <li>Community-contributed benchmarks portal</li>
                        <li>Integration with IndiaAI Mission compute grid</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </motion.div>
          </div>

          {/* Glow Line */}
          <div className="glow-line max-w-[200px] mx-auto my-6" />

          {/* IITGN badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-6"
          >
            <span className="inline-flex items-center gap-2 glass-card glass-surface px-5 py-2.5 text-xs font-medium text-[#f59e0b] border-[rgba(245,158,11,0.2)] rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] glow-saffron-sm" />
              Built for the IndiaAI Mission — at IIT Gandhinagar
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
