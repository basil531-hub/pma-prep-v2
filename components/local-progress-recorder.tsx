"use client";

import { useEffect } from "react";

export function LocalProgressRecorder({ score, total, percentage, passed }: { score: number; total: number; percentage: number; passed: boolean }) {
  useEffect(() => { window.localStorage.setItem("pma-initial-progress", JSON.stringify({ score, total, percentage, passed })); }, [score, total, percentage, passed]);
  return null;
}
