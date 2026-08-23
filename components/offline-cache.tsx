"use client";
import { useEffect } from "react";
export function OfflineCache({ cacheKey, data }: { cacheKey: string; data: unknown }) {
  useEffect(() => { try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* Storage may be unavailable. */ } }, [cacheKey, data]);
  return null;
}