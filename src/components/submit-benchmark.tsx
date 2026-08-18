"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitBenchmark } from "@/lib/api";

const CATEGORY_OPTIONS = ["Legal", "Healthcare", "Fintech", "Vernacular", "Education"] as const;
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  difficulty: "",
  numQuestions: "",
  submitterName: "",
  submitterEmail: "",
};

type FormState = typeof EMPTY_FORM;

export function SubmitBenchmark() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string[] => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push("Benchmark Name");
    if (!form.category) missing.push("Category");
    if (!form.difficulty) missing.push("Difficulty");
    if (!form.numQuestions.trim() || Number(form.numQuestions) <= 0) missing.push("Number of Questions");
    if (!form.description.trim()) missing.push("Description");
    if (!form.submitterName.trim()) missing.push("Your Name");
    if (!form.submitterEmail.trim()) missing.push("Your Email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail.trim())) missing.push("Valid Email");
    return missing;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const missing = validate();
    if (missing.length > 0) {
      toast.error("Missing required fields", {
        description: missing.join(", "),
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitBenchmark({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        difficulty: form.difficulty,
        numQuestions: Math.floor(Number(form.numQuestions)),
        submitterName: form.submitterName.trim(),
        submitterEmail: form.submitterEmail.trim(),
        sampleQuestions: "[]",
      });

      if (res.success) {
        toast.success("Thank you for your submission!", {
          description: "Our team will review your benchmark proposal shortly.",
        });
        setForm(EMPTY_FORM);
        setSubmitted(true);
      } else {
        toast.error("Submission failed", {
          description: "Please try again later.",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Submission failed", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm(EMPTY_FORM);
  };

  return (
    <section id="contribute" className="relative py-16 md:py-20">
      <div className="absolute inset-0 mesh-gradient-section" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-2 text-center text-2xl font-bold md:text-3xl font-[family-name:var(--font-playfair)]"
        >
          Contribute a Benchmark
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center text-[#8b8b9e]"
        >
          Help expand India&apos;s AI evaluation coverage
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-2xl"
        >
          <div className="glass-card p-6 md:p-8 relative overflow-hidden">
            {/* Decorative mesh accent blobs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[rgba(245,158,11,0.05)] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[rgba(16,185,129,0.04)] blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="mx-auto mb-5 w-16 h-16 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center glow-emerald"
                    >
                      <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
                    </motion.div>
                    <h3 className="text-xl font-semibold font-[family-name:var(--font-playfair)] text-[#f5f5f7] mb-2">
                      Thank you!
                    </h3>
                    <p className="text-sm text-[#8b8b9e] max-w-sm mx-auto mb-6">
                      Your benchmark proposal has been received. Our team will review it and reach out via email if it&apos;s a fit for IndicBench.
                    </p>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-xl glass-pill glass-pill-active px-5 py-2.5 text-sm font-medium transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      Submit another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Benchmark Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bm-name" className="text-sm font-medium text-[#f5f5f7]">
                        Benchmark Name <span className="text-[#f59e0b]">*</span>
                      </Label>
                      <Input
                        id="bm-name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="e.g., Indian Contract Law QA"
                        className="dark-select-trigger !rounded-xl h-11"
                        maxLength={120}
                        disabled={submitting}
                      />
                    </div>

                    {/* Category + Difficulty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-[#f5f5f7]">
                          Category <span className="text-[#f59e0b]">*</span>
                        </Label>
                        <Select
                          value={form.category}
                          onValueChange={(v) => update("category", v)}
                          disabled={submitting}
                        >
                          <SelectTrigger className="dark-select-trigger !rounded-xl h-11">
                            <SelectValue placeholder="Select category…" />
                          </SelectTrigger>
                          <SelectContent className="dark-select-content !rounded-xl">
                            {CATEGORY_OPTIONS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-[#f5f5f7]">
                          Difficulty <span className="text-[#f59e0b]">*</span>
                        </Label>
                        <Select
                          value={form.difficulty}
                          onValueChange={(v) => update("difficulty", v)}
                          disabled={submitting}
                        >
                          <SelectTrigger className="dark-select-trigger !rounded-xl h-11">
                            <SelectValue placeholder="Select difficulty…" />
                          </SelectTrigger>
                          <SelectContent className="dark-select-content !rounded-xl">
                            {DIFFICULTY_OPTIONS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Num Questions */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bm-num" className="text-sm font-medium text-[#f5f5f7]">
                        Number of Questions <span className="text-[#f59e0b]">*</span>
                      </Label>
                      <Input
                        id="bm-num"
                        type="number"
                        min={1}
                        max={10000}
                        value={form.numQuestions}
                        onChange={(e) => update("numQuestions", e.target.value)}
                        placeholder="e.g., 200"
                        className="dark-select-trigger !rounded-xl h-11 font-[family-name:var(--font-geist-mono)] tabular-nums"
                        disabled={submitting}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bm-desc" className="text-sm font-medium text-[#f5f5f7]">
                        Description <span className="text-[#f59e0b]">*</span>
                      </Label>
                      <Textarea
                        id="bm-desc"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        placeholder="Describe what this benchmark evaluates, the source of questions, and the evaluation criteria…"
                        className="dark-select-trigger !rounded-xl min-h-[100px] resize-y"
                        maxLength={1000}
                        disabled={submitting}
                      />
                      <div className="text-right text-[10px] text-[#55556a] font-[family-name:var(--font-geist-mono)] tabular-nums">
                        {form.description.length} / 1000
                      </div>
                    </div>

                    {/* Submitter Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bm-submitter" className="text-sm font-medium text-[#f5f5f7]">
                          Your Name <span className="text-[#f59e0b]">*</span>
                        </Label>
                        <Input
                          id="bm-submitter"
                          value={form.submitterName}
                          onChange={(e) => update("submitterName", e.target.value)}
                          placeholder="Your full name"
                          className="dark-select-trigger !rounded-xl h-11"
                          maxLength={120}
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bm-email" className="text-sm font-medium text-[#f5f5f7]">
                          Your Email <span className="text-[#f59e0b]">*</span>
                        </Label>
                        <Input
                          id="bm-email"
                          type="email"
                          value={form.submitterEmail}
                          onChange={(e) => update("submitterEmail", e.target.value)}
                          placeholder="you@example.com"
                          className="dark-select-trigger !rounded-xl h-11"
                          maxLength={160}
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3.5 text-base font-semibold text-[#0a0a0f] transition-all hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed pulse-glow-saffron"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Submit Benchmark
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-[#55556a]">
                      Submissions are reviewed by the IndicBench team before publication.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
