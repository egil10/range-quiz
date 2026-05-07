"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Cpu,
  Earth,
  Flame,
  Leaf,
  Microscope,
  Radar,
  Shuffle,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { allQuestionsFromSeeds } from "@/lib/quiz/generate-questions";
import { ALL_METRIC_SEEDS, METRIC_COUNT } from "@/lib/quiz/seeds";
import {
  buildSessionPool,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  levelFromXp,
  storageKeys,
  xpBandForLevel,
  xpGainForAnswer,
} from "@/lib/quiz/session-utils";
import type { QuizCategory, QuizQuestion } from "@/lib/quiz/types";

const ALL_QUESTIONS = allQuestionsFromSeeds(ALL_METRIC_SEEDS);

const iconForCategory = (c: QuizCategory) => {
  switch (c) {
    case "finance":
      return TrendingUp;
    case "economics":
      return BarChart3;
    case "medicine":
      return Stethoscope;
    case "science":
      return Microscope;
    case "engineering":
      return Building2;
    case "technology":
      return Cpu;
    case "earth":
      return Leaf;
    case "psychology":
      return Brain;
    default:
      return Radar;
  }
};

function CategoryChip({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Activity;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition",
        active
          ? "border-white/15 bg-white/10 text-white shadow-glow"
          : "border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/15 hover:bg-white/[0.06]",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 opacity-90" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function xpBarFraction(total: number) {
  const lv = levelFromXp(total);
  const { min, max } = xpBandForLevel(lv);
  const span = Math.max(1, max - min);
  const t = Math.min(1, Math.max(0, (total - min) / span));
  const toNext = max - total;
  return { lv, t, toNext, max };
}

export function QuizApp() {
  const reduceMotion = useReducedMotion();
  const keys = storageKeys();

  const [categories, setCategories] = useState<Set<QuizCategory>>(new Set());
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 2 ** 30));
  const [queue, setQueue] = useState<QuizQuestion[]>(() => buildSessionPool(ALL_QUESTIONS, new Set(), sessionSeed));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"home" | "play">("home");

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [bestXpSession, setBestXpSession] = useState(0);

  const [selected, setSelected] = useState<number | null>(null);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const current = queue[idx];

  useEffect(() => {
    try {
      const b = Number(window.localStorage.getItem(keys.bestStreak));
      const bx = Number(window.localStorage.getItem(keys.bestXpSession));
      const snd = window.localStorage.getItem(keys.sound);
      if (Number.isFinite(b)) setBestStreak(b);
      if (Number.isFinite(bx)) setBestXpSession(bx);
      if (snd === "0") setSoundOn(false);
    } catch {
      /* ignore */
    }
  }, [keys.bestStreak, keys.bestXpSession, keys.sound]);

  useEffect(() => {
    try {
      window.localStorage.setItem(keys.sound, soundOn ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [keys.sound, soundOn]);

  const playTick = useCallback(
    (kind: "ok" | "bad" | "ui") => {
      if (!soundOn || typeof window === "undefined") return;
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = kind === "ok" ? 740 : kind === "bad" ? 190 : 440;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const t0 = ctx.currentTime;
        g.gain.exponentialRampToValueAtTime(0.085, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
        o.start(t0);
        o.stop(t0 + 0.14);
        o.onended = () => ctx.close();
      } catch {
        /* ignore */
      }
    },
    [soundOn],
  );

  const toggleCategory = useCallback((c: QuizCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    const q = buildSessionPool(ALL_QUESTIONS, categories, Math.floor(Math.random() * 2 ** 30));
    setQueue(q);
    setIdx(0);
    setStreak(0);
    setXp(0);
    setSelected(null);
    setLastOk(null);
    setPhase("play");
    playTick("ui");
  }, [categories, playTick]);

  const level = levelFromXp(xp);
  const { t: xpFrac, toNext } = xpBarFraction(xp);

  const onPick = useCallback(
    (choiceIndex: number) => {
      if (!current || selected !== null) return;
      setSelected(choiceIndex);
      const ok = choiceIndex === current.correctIndex;
      setLastOk(ok);

      if (ok) {
        const ns = streak + 1;
        setStreak(ns);
        setBestStreak((bs) => {
          const nbs = Math.max(bs, ns);
          try {
            window.localStorage.setItem(keys.bestStreak, String(nbs));
          } catch {
            /* ignore */
          }
          return nbs;
        });
        const gain = xpGainForAnswer(ns);
        setXp((x) => {
          const nx = x + gain;
          setBestXpSession((bx) => {
            const nbx = Math.max(bx, nx);
            try {
              window.localStorage.setItem(keys.bestXpSession, String(nbx));
            } catch {
              /* ignore */
            }
            return nbx;
          });
          return nx;
        });
        playTick("ok");
      } else {
        setStreak(0);
        playTick("bad");
      }

      window.setTimeout(() => {
        setSelected(null);
        setLastOk(null);
        setIdx((i) => {
          if (i + 1 >= queue.length) {
            setPhase("home");
            return 0;
          }
          return i + 1;
        });
      }, reduceMotion ? 650 : 950);
    },
    [current, keys.bestStreak, keys.bestXpSession, playTick, queue.length, reduceMotion, selected, streak],
  );

  const progressLabel = useMemo(() => {
    if (phase !== "play") return "";
    return `${idx + 1} / ${queue.length}`;
  }, [idx, phase, queue.length]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-10 pt-8 sm:px-6 sm:pt-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-glow">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-ink-muted">Ultimate</p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Range Quiz</h1>
            </div>
          </div>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted sm:text-[15px]">
            Pick the band that matches the real-world intuition for each metric. Thousands of generated multiple-choice
            ranges spanning finance, economics, medicine, science, engineering, and more.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setSoundOn((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-ink-muted transition hover:border-white/15 hover:bg-white/[0.06]"
            aria-label="Toggle subtle sound"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Sound
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div layout className="glass relative overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          {phase === "home" ? (
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[12px] text-ink-muted">
                  <Sparkles className="h-4 w-4 text-amber-200/90" />
                  {METRIC_COUNT.toLocaleString()} metric seeds → {(METRIC_COUNT * 9).toLocaleString()} questions
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[12px] text-ink-muted">
                  <Shuffle className="h-4 w-4 text-sky-200/90" />
                  Shuffled session every run
                </span>
              </div>

              <h2 className="mt-6 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Calibrate your gut for multiples, concentrations, constants, and clinical norms.
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
                Toggle topics to focus—or leave all off for the full chaos deck. You will streak, level up, and get
                instant explainers after each pick.
              </p>

              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-muted">Topics</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORY_ORDER.map((c) => (
                    <CategoryChip
                      key={c}
                      active={categories.has(c)}
                      label={CATEGORY_LABEL[c]}
                      icon={iconForCategory(c)}
                      onClick={() => toggleCategory(c)}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-ink-muted">
                  {categories.size === 0
                    ? "No filters: all categories in the pool."
                    : `${categories.size} filter${categories.size === 1 ? "" : "s"} active.`}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={startGame}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-[15px] font-semibold text-white shadow-glow transition hover:bg-accent-dim"
                >
                  Start run
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[13px] text-ink-muted">
                  <Trophy className="h-4 w-4 text-amber-200/80" />
                  <span>
                    Best streak{" "}
                    <span className="font-semibold text-white">{Math.max(bestStreak, streak)}</span>
                  </span>
                  <span className="text-white/15">•</span>
                  <span>
                    Best session XP <span className="font-semibold text-white">{bestXpSession}</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    t: "Fast feedback",
                    d: "Smooth motion, minimal chrome, one-tap answers.",
                    i: Activity,
                  },
                  {
                    t: "Serious breadth",
                    d: "From HHI and P/E to CMB, SI prefixes, and TTLs.",
                    i: Earth,
                  },
                  {
                    t: "Progression you feel",
                    d: "Streak bonuses, XP, levels, and streak risk.",
                    i: Flame,
                  },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <x.i className="h-4 w-4 text-accent" />
                      {x.t}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[12px] text-ink-muted">
                    {progressLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[12px] text-ink-muted">
                    Lvl <span className="font-semibold text-white">{level}</span>
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[12px] text-ink-muted">
                    Streak <span className="font-semibold text-white">{streak}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhase("home")}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-ink-muted transition hover:border-white/15"
                >
                  End run
                </button>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[12px] text-ink-muted">
                  <span>
                    XP <span className="font-semibold text-white">{xp}</span>
                  </span>
                  <span>
                    Next level in <span className="font-semibold text-white">{Math.max(0, Math.ceil(toNext))}</span> XP
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-300"
                    initial={false}
                    animate={{ width: `${Math.round(xpFrac * 100)}%` }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {current ? (
                  <motion.div
                    key={current.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-7"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[12px] text-ink-muted">
                        {(() => {
                          const Icon = iconForCategory(current.category);
                          return <Icon className="h-4 w-4" />;
                        })()}
                        {CATEGORY_LABEL[current.category]}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[12px] text-ink-muted">
                        <Radar className="h-4 w-4" />
                        Range challenge
                      </span>
                    </div>

                    <h3 className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                      {current.name}
                    </h3>
                    <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink-muted">{current.context}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {current.choices.map((c, i) => {
                        const state =
                          selected === null ? "idle" : i === current.correctIndex ? "correct" : i === selected ? "wrong" : "fade";
                        const base =
                          "relative w-full rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
                        const styles =
                          state === "correct"
                            ? "border-emerald-300/40 bg-emerald-400/10"
                            : state === "wrong"
                              ? "border-rose-300/40 bg-rose-400/10"
                              : state === "fade"
                                ? "border-white/10 bg-white/[0.02] opacity-45"
                                : "border-white/10 bg-white/[0.05] hover:border-white/15 hover:bg-white/[0.07]";
                        return (
                          <motion.button
                            key={`${current.id}-${c.label}`}
                            type="button"
                            disabled={selected !== null}
                            onClick={() => onPick(i)}
                            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                            className={`${base} ${styles}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                                  Option {String.fromCharCode(65 + i)}
                                </p>
                                <p className="mt-2 font-mono text-[15px] font-semibold text-white">{c.label}</p>
                              </div>
                              {state === "correct" ? (
                                <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                                  Best band
                                </span>
                              ) : null}
                              {state === "wrong" ? (
                                <span className="rounded-full bg-rose-400/15 px-2 py-1 text-[11px] font-semibold text-rose-100">
                                  Nope
                                </span>
                              ) : null}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {selected !== null ? (
                        <motion.div
                          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                          transition={{ duration: 0.18 }}
                          className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            {lastOk ? (
                              <span className="text-emerald-200">Nice — intuition on point.</span>
                            ) : (
                              <span className="text-rose-100">Miss — lock it in for next time.</span>
                            )}
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{current.explanation}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-10 text-sm text-ink-muted"
                  >
                    Preparing deck…
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <aside className="space-y-5">
          <div className="glass rounded-3xl border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-muted">Run stats</p>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[12px] text-ink-muted">
                {(METRIC_COUNT * 9).toLocaleString()} combos
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-[12px] text-ink-muted">
                  <Flame className="h-4 w-4 text-amber-200/80" />
                  Streak
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{streak}</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  best <span className="font-semibold text-white">{bestStreak}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-[12px] text-ink-muted">
                  <Sparkles className="h-4 w-4 text-indigo-200/80" />
                  XP
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{xp}</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  level <span className="font-semibold text-white">{level}</span>
                </p>
              </div>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">
              Streaks juice your XP per correct answer—then reset hard on a miss. Risk/reward, but for nerds.
            </p>
          </div>

          <div className="glass rounded-3xl border border-white/10 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-muted">Health note</p>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Medicine entries are for classroom-style intuition, not diagnosis or treatment. Real patients need real
              clinicians and real labs.
            </p>
          </div>
        </aside>
      </section>

      <footer className="mt-auto pt-12 text-center text-[12px] text-ink-muted">
        Built for keyboard-smashing curiosity — ship it to Vercel and share the pain.
      </footer>
    </main>
  );
}
