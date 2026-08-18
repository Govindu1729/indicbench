"use client";

import { useState, useEffect, useRef } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export function TypingText({ text, speed = 40, delay = 0, className = "" }: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const initialized = useRef(false);

  // Start after delay — use setTimeout even for 0 delay to avoid synchronous setState in effect
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const timer = setTimeout(() => setStarted(true), Math.max(delay, 16));
    return () => clearTimeout(timer);
  }, [delay]);

  // Type character by character
  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  const isComplete = displayed.length >= text.length;

  return (
    <span className={className}>
      {displayed}
      {!isComplete && <span className="typing-cursor" />}
    </span>
  );
}
