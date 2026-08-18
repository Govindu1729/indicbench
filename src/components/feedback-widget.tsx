"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Star, X, Send, CheckCircle2 } from "lucide-react";

const FEEDBACK_KEY = "indicbench-feedback";

interface FeedbackEntry {
  rating: number;
  text: string;
  timestamp: number;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hasExisting, setHasExisting] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const raw = localStorage.getItem(FEEDBACK_KEY);
      if (raw) {
        const entries: FeedbackEntry[] = JSON.parse(raw);
        return entries.length > 0;
      }
      return false;
    } catch {
      return false;
    }
  });

  const handleSubmit = useCallback(() => {
    if (rating === 0) return;

    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      const entries: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
      entries.push({
        rating,
        text: text.trim(),
        timestamp: Date.now(),
      });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
      setSubmitted(true);
      setHasExisting(true);
    } catch {
      // noop
    }
  }, [rating, text]);

  const handleReset = useCallback(() => {
    setRating(0);
    setText("");
    setSubmitted(false);
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Floating Button — Bottom Left */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 h-12 w-12 rounded-full flex items-center justify-center shadow-lg shadow-black/20 border border-[rgba(255,255,255,0.1)] transition-all"
        style={{
          background: hasExisting
            ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))"
            : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          backdropFilter: "blur(12px)",
        }}
        aria-label="Provide feedback"
      >
        {hasExisting ? (
          <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
        ) : (
          <MessageSquare className="h-5 w-5 text-[#8b8b9e]" />
        )}
      </motion.button>

      {/* Slide-up Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md"
            >
              <div
                className="m-3 rounded-2xl border border-[rgba(255,255,255,0.1)] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(20,20,30,0.95), rgba(10,10,15,0.98))",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-8 h-1 rounded-full bg-[rgba(255,255,255,0.15)]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#f59e0b15] text-[#f59e0b]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-bold text-[#f5f5f7]">
                      Feedback
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[#55556a] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.06)] transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-5">
                  {submitted ? (
                    /* Confirmation */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10b98115] text-[#10b981] mb-4">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div className="text-lg font-bold text-[#f5f5f7] mb-1">
                        Thanks for your feedback!
                      </div>
                      <div className="text-sm text-[#8b8b9e] mb-4">
                        Your input helps us improve IndicBench
                      </div>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.06)] text-[#8b8b9e] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      {/* Question */}
                      <div className="text-sm text-[#f5f5f7] mb-3">
                        How useful is this benchmark data?
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="h-10 w-10 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              backgroundColor:
                                star <= (hoverRating || rating)
                                  ? "rgba(251,191,36,0.15)"
                                  : "transparent",
                            }}
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star
                              className="h-5 w-5 transition-colors"
                              style={{
                                fill:
                                  star <= (hoverRating || rating)
                                    ? "#fbbf24"
                                    : "none",
                                color:
                                  star <= (hoverRating || rating)
                                    ? "#fbbf24"
                                    : "#55556a",
                              }}
                            />
                          </motion.button>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-xs text-[#fbbf24] font-medium">
                            {rating}/5
                          </span>
                        )}
                      </div>

                      {/* Text Feedback */}
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Optional: share specific feedback or suggestions..."
                        rows={3}
                        className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-sm text-[#f5f5f7] placeholder:text-[#55556a] focus:outline-none focus:border-[rgba(255,255,255,0.15)] resize-none transition-all"
                      />

                      {/* Submit */}
                      <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#10b98120] text-[#10b981] border border-[#10b98140] hover:bg-[#10b98130]"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Submit Feedback
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
