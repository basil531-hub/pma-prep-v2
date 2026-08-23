"use client";
import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const [urdu, setUrdu] = useState(false);
  useEffect(() => { setUrdu(localStorage.getItem("language") === "ur"); }, []);
  function toggle() {
    const next = !urdu; setUrdu(next); localStorage.setItem("language", next ? "ur" : "en");
    document.documentElement.lang = next ? "ur" : "en"; document.documentElement.dir = next ? "rtl" : "ltr";
  }
  return <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle language"><Languages className="mr-2 h-4 w-4" />{urdu ? "English" : "اردو"}</Button>;
}
