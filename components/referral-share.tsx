"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReferralShare({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const message = encodeURIComponent(`I’m preparing for PMA Initial and ISSB on PMA Prep. Start with free credits using my link: ${url}`);
  return <div className="flex flex-wrap gap-2"><Button type="button" onClick={copy}>{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? "Copied" : "Copy referral link"}</Button><Button asChild variant="outline"><a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />Share on WhatsApp</a></Button></div>;
}
