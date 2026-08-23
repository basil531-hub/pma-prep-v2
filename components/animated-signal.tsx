"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedSignal({ value, label }: { value: string; label: string }) {
  const target = Number(value.replace(/[^0-9]/g, ""));
  const suffix = value.includes("+") ? "+" : "";
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const signalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = signalRef.current;
    if (!element || started) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(target);
        return;
      }
      const startTime = performance.now();
      const duration = 1400;
      const animate = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [started, target]);

  return <div ref={signalRef} className="min-w-0 px-2 py-4 text-center sm:px-5 sm:py-0"><p className="text-xl font-black tabular-nums text-slate-950 sm:text-3xl" aria-label={`${value} ${label}`}>{display.toLocaleString()}{suffix}</p><p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500 sm:text-xs sm:leading-5">{label}</p></div>;
}
