import type { QuizCategory, QuizQuestion } from "./types";

export const CATEGORY_ORDER: QuizCategory[] = [
  "finance",
  "economics",
  "medicine",
  "science",
  "engineering",
  "technology",
  "earth",
  "psychology",
  "general",
];

export const CATEGORY_LABEL: Record<QuizCategory, string> = {
  finance: "Finance",
  economics: "Economics",
  medicine: "Medicine",
  science: "Science",
  engineering: "Engineering",
  technology: "Technology",
  earth: "Earth",
  psychology: "Psychology",
  general: "General",
};

export function levelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return 1 + Math.floor(Math.sqrt(xp / 160));
}

export function xpBandForLevel(level: number): { min: number; max: number } {
  if (level <= 1) return { min: 0, max: 160 };
  const min = (level - 1) ** 2 * 160;
  const max = level ** 2 * 160;
  return { min, max };
}

export function xpGainForAnswer(streakAfter: number): number {
  const s = Math.max(0, streakAfter);
  return 14 + Math.min(18, s) * 3;
}

export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSessionPool(all: QuizQuestion[], categories: Set<QuizCategory>, seed: number): QuizQuestion[] {
  const filtered = categories.size === 0 ? all : all.filter((q) => categories.has(q.category));
  const base = filtered.length > 0 ? filtered : all;
  return shuffleWithSeed(base, seed);
}

export function storageKeys() {
  return {
    bestStreak: "rangeQuiz.bestStreak.v1",
    bestXpSession: "rangeQuiz.bestXpSession.v1",
    sound: "rangeQuiz.sound.v1",
  } as const;
}
