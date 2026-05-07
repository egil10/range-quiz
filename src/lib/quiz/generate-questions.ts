import { formatBand } from "./format";
import type { MetricSeed, QuizQuestion, RangeChoice } from "./types";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spacingOf(seed: MetricSeed): "linear" | "log" {
  if (seed.spacing) return seed.spacing;
  if (seed.low > 0 && seed.high / seed.low >= 25) return "log";
  return "linear";
}

function nonOverlapShift(
  lo: number,
  hi: number,
  rng: () => number,
  attempts: number,
  busy: Array<{ a: number; b: number }>,
): { min: number; max: number } | null {
  const w = hi - lo;
  const mid = (hi + lo) / 2;
  for (let k = 0; k < attempts; k++) {
    const dir = rng() < 0.5 ? -1 : 1;
    const mag = dir * (1.4 + rng() * 3.6) * Math.max(w, Math.abs(mid) * 0.05, 1e-9);
    const scale = 0.65 + rng() * 0.9;
    const nw = Math.max(w * scale, Math.max(Math.abs(mid * 0.02), 1e-9));
    const nmid = mid + mag * (0.85 + rng() * 0.6);
    const mn = nmid - nw / 2;
    const mx = nmid + nw / 2;
    const pad = Math.max(nw, w) * 0.05;
    const overlapsCorrect = !(mx < lo - pad || mn > hi + pad);
    if (overlapsCorrect) continue;
    let hit = false;
    for (const b of busy) {
      if (!(mx < b.a - pad || mn > b.b + pad)) {
        hit = true;
        break;
      }
    }
    if (!hit) return { min: mn, max: mx };
  }
  return null;
}

function logNonOverlap(
  lo: number,
  hi: number,
  rng: () => number,
  attempts: number,
  busy: Array<{ a: number; b: number }>,
): { min: number; max: number } | null {
  const logLo = Math.log(lo);
  const logHi = Math.log(hi);
  const lw = logHi - logLo;
  const lmid = (logHi + logLo) / 2;
  for (let k = 0; k < attempts; k++) {
    const dir = rng() < 0.5 ? -1 : 1;
    const mag = dir * (0.9 + rng() * 2.8) * Math.max(lw, 0.35);
    const scale = 0.65 + rng() * 0.85;
    const nlw = Math.max(lw * scale, 0.25);
    const nlmid = lmid + mag * (0.7 + rng() * 0.5);
    const mn = Math.exp(nlmid - nlw / 2);
    const mx = Math.exp(nlmid + nlw / 2);
    const pad = 0.06;
    const overlapsCorrect = !(mx < lo * (1 - pad) || mn > hi * (1 + pad));
    if (overlapsCorrect) continue;
    let hit = false;
    for (const b of busy) {
      if (!(mx < b.a * (1 - pad) || mn > b.b * (1 + pad))) {
        hit = true;
        break;
      }
    }
    if (!hit) return { min: mn, max: mx };
  }
  return null;
}

function buildChoices(seed: MetricSeed, variant: number): { choices: RangeChoice[]; correctIndex: number } {
  const rng = mulberry32(hashStr(`${seed.id}|v${variant}`) >>> 0);
  const spacing = spacingOf(seed);
  let lo = seed.low;
  let hi = seed.high;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    lo = 0;
    hi = 1;
  }
  if (hi < lo) [lo, hi] = [hi, lo];
  if (hi === lo) {
    const eps = Math.abs(lo) * 1e-6 + 1e-9;
    hi = lo + eps;
  }

  const correct: RangeChoice = {
    min: lo,
    max: hi,
    label: formatBand(lo, hi, seed.unit),
  };

  const busy = [{ a: lo, b: hi }];
  const wrong: RangeChoice[] = [];

  for (let i = 0; i < 3; i++) {
    const alt =
      spacing === "log" && lo > 0
        ? logNonOverlap(lo, hi, rng, 80, busy)
        : nonOverlapShift(lo, hi, rng, 80, busy);
    if (!alt) {
      const bump = (hi - lo) * (2 + i + rng());
      const sign = i % 2 === 0 ? 1 : -1;
      const mn = Math.max(0, lo + sign * bump);
      const mx = mn + Math.max((hi - lo) * 0.8, 1e-9);
      busy.push({ a: mn, b: mx });
      wrong.push({ min: mn, max: mx, label: formatBand(mn, mx, seed.unit) });
    } else {
      busy.push({ a: alt.min, b: alt.max });
      wrong.push({
        min: alt.min,
        max: alt.max,
        label: formatBand(alt.min, alt.max, seed.unit),
      });
    }
  }

  const all: RangeChoice[] = [correct, ...wrong];
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map((idx) => all[idx]);
  const correctIndex = shuffled.findIndex((c) => c.min === correct.min && c.max === correct.max);
  return { choices: shuffled, correctIndex };
}

const VARIANTS = 9;

export function questionFromSeed(seed: MetricSeed, variant: number): QuizQuestion {
  const v = ((variant % VARIANTS) + VARIANTS) % VARIANTS;
  const { choices, correctIndex } = buildChoices(seed, v);
  return {
    id: `${seed.id}::${v}`,
    seedId: seed.id,
    variant: v,
    name: seed.name,
    category: seed.category,
    context: seed.context,
    unit: seed.unit,
    spacing: spacingOf(seed),
    correctIndex,
    choices,
    explanation: seed.explanation,
  };
}

export function allQuestionsFromSeeds(seeds: MetricSeed[]): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const s of seeds) {
    for (let v = 0; v < VARIANTS; v++) out.push(questionFromSeed(s, v));
  }
  return out;
}
