"use client";

import { useEffect, useState, useMemo, useRef } from "react";

interface ConfettiProps {
  active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate particles whenever active becomes true
  const particles = useMemo(() => {
    if (!active) return [];
    const colors = [
      "#f59e0b",
      "#10b981",
      "#f97316",
      "#a78bfa",
      "#fbbf24",
      "#34d399",
    ];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 100),
      color: colors[i % colors.length],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
    }));
  }, [active]);

  useEffect(() => {
    if (active) {
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 2500);
    } else {
      setVisible(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  if (!visible || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] flex items-center justify-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm confetti-particle"
          style={
            {
              backgroundColor: p.color,
              "--tx": `${p.x}px`,
              "--ty": `${p.y}px`,
              "--rot": `${p.rotation}deg`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
