"use server";

import { recordPracticeAttempt } from "@/app/dashboard/actions";

const leadershipWords = ["lead", "team", "listen", "plan", "responsib", "improve", "learn", "calm", "support", "decide"];

export async function submitInterviewAnswer(question: string, answer: string) {
  const cleaned = answer.trim();
  if (cleaned.length < 40) throw new Error("Please write at least a few complete sentences before requesting feedback.");

  const words = cleaned.split(/\s+/).filter(Boolean);
  const matches = leadershipWords.filter((word) => cleaned.toLowerCase().includes(word)).length;
  const hasExample = /\b(when|while|during|once|because|result|learned)\b/i.test(cleaned);
  const hasStructure = /\b(first|then|finally|as a result)\b/i.test(cleaned);
  const score = Math.min(100, Math.round(38 + Math.min(words.length, 130) * 0.3 + matches * 7 + (hasExample ? 12 : 0) + (hasStructure ? 8 : 0)));
  const tips = [
    words.length < 80 ? "Add a little more detail so the interviewer can understand your specific contribution." : "Your answer has useful detail; keep the delivery concise and natural.",
    hasExample ? "You included an example, which makes your answer more credible." : "Use one real example: situation, your action, and the result.",
    matches >= 2 ? "Your answer reflects teamwork and responsibility well." : "Show your role in the team, what you decided, and what you learned.",
  ];
  await recordPracticeAttempt("ISSB Interview Simulation", score);
  return { score, tips, question };
}

export async function completeIssbExercise(module: string, score = 75) {
  await recordPracticeAttempt(`ISSB ${module}`, score);
}
