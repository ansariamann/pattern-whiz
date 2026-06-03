import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarDays, Check, Heart, Lightbulb, RotateCcw, Sparkles, Trophy, Zap, Flame, GraduationCap, Shuffle, ArrowRight } from "lucide-react";
import {
  newPatternFiltered,
  checkAnswer,
  getDailyLetterPattern,
  dailyDateKey,
  type Pattern,
  type Difficulty,
} from "@/lib/patterns";

type DiffFilter = Difficulty | "All";

const DIFF_META: Record<
  Difficulty,
  { label: string; xp: number; gradient: string; ring: string; chip: string; icon: typeof Zap }
> = {
  Easy:   { label: "Easy",   xp: 10, gradient: "from-emerald-400 to-teal-500", ring: "ring-emerald-400/40", chip: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: Sparkles },
  Medium: { label: "Medium", xp: 20, gradient: "from-sky-400 to-indigo-500",   ring: "ring-sky-400/40",     chip: "bg-sky-500/15 text-sky-600 border-sky-500/30",         icon: Zap },
  Hard:   { label: "Hard",   xp: 40, gradient: "from-orange-400 to-rose-500",  ring: "ring-rose-400/40",    chip: "bg-rose-500/15 text-rose-600 border-rose-500/30",       icon: Flame },
  GATE:   { label: "GATE",   xp: 80, gradient: "from-fuchsia-500 to-violet-600",ring: "ring-fuchsia-500/50",chip: "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/30",icon: GraduationCap },
};

const LEVEL_STEP = 100;
const MAX_LIVES = 5;
const STORAGE_KEY = "pattern-whiz:v1";
const DAILY_STORAGE_KEY = "pattern-whiz:daily:v1";

// Deterministic placeholder used for the initial render so SSR and the first
// client paint agree. The real random pattern is generated in a useEffect.
const PLACEHOLDER_PATTERN: Pattern = {
  series: ["2", "4", "6", "8", "10"],
  answer: "12",
  acceptable: ["12"],
  name: "Arithmetic",
  hint: "Each number increases by a fixed amount.",
  difficulty: "Easy",
};
const PLACEHOLDER_CHOICES = ["12", "11", "14", "13"];

// Build 4 multiple-choice options including the correct answer.
function buildChoices(pattern: Pattern, count = 4): string[] {
  const answer = pattern.answer;
  const set = new Set<string>([answer]);
  const isNum = /^-?\d+(\.\d+)?$/.test(answer);
  if (isNum) {
    const n = Number(answer);
    const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10];
    // shuffle deltas for variety
    for (let i = deltas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deltas[i], deltas[j]] = [deltas[j], deltas[i]];
    }
    for (const d of deltas) {
      if (set.size >= count) break;
      const v = String(n + d);
      if (!pattern.acceptable.includes(v)) set.add(v);
    }
  } else {
    const chars = answer.split("");
    const shiftAt = (idx: number, delta: number) => {
      const c = chars[idx];
      const code = c.charCodeAt(0);
      let nc = c;
      if (/[A-Z]/.test(c)) nc = String.fromCharCode(((code - 65 + delta + 26) % 26) + 65);
      else if (/[a-z]/.test(c)) nc = String.fromCharCode(((code - 97 + delta + 26) % 26) + 97);
      else if (/\d/.test(c)) nc = String((Number(c) + delta + 10) % 10);
      const next = [...chars];
      next[idx] = nc;
      return next.join("");
    };
    const order: [number, number][] = [];
    for (const d of [1, -1, 2, -2, 3, -3]) {
      for (let i = chars.length - 1; i >= 0; i--) order.push([i, d]);
    }
    for (const [i, d] of order) {
      if (set.size >= count) break;
      const v = shiftAt(i, d);
      if (v !== answer && !pattern.acceptable.includes(v)) set.add(v);
    }
    // last-resort filler
    let fill = 0;
    while (set.size < count && fill < 50) {
      set.add(answer + String.fromCharCode(65 + (fill % 26)));
      fill++;
    }
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

type DailyState = {
  date: string;
  pattern: Pattern;
  choices: string[];
  attempted: boolean;
  success: boolean;
};

type DailyPersisted = {
  streak: number;
  lastCompletedDate: string | null;
  today: DailyState | null;
};

const loadDaily = (): DailyPersisted => {
  if (typeof window === "undefined") {
    return { streak: 0, lastCompletedDate: null, today: null };
  }
  try {
    const raw = window.localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return { streak: 0, lastCompletedDate: null, today: null };
    const parsed = JSON.parse(raw) as DailyPersisted;
    return {
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastCompletedDate: parsed.lastCompletedDate ?? null,
      today: parsed.today ?? null,
    };
  } catch {
    return { streak: 0, lastCompletedDate: null, today: null };
  }
};

const saveDaily = (data: DailyPersisted) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

const isYesterday = (prev: string | null, today: string): boolean => {
  if (!prev) return false;
  const p = new Date(prev + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((t.getTime() - p.getTime()) / 86400000);
  return diff === 1;
};

type PersistedState = {
  best: number;
  highExp: number;
  highLevel: number;
  totalSolved: number;
  filter: DiffFilter;
  // Live game state so refresh doesn't reset progress
  exp: number;
  solved: number;
  streak: number;
  lives: number;
  pattern: Pattern | null;
  choices: string[];
  revealed: boolean;
  hintUsed: boolean;
  lastGain: number;
};

const loadPersisted = (): Partial<PersistedState> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
};

const savePersisted = (data: PersistedState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or disabled — ignore */
  }
};

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Predict the Next — Pattern Puzzle Game" },
      {
        name: "description",
        content:
          "Spot the pattern and predict the next item. Numbers, letters, shapes — a new puzzle every round.",
      },
    ],
  }),
});

function Index() {
  const [filter, setFilter] = useState<DiffFilter>("All");
  const [pattern, setPattern] = useState<Pattern>(PLACEHOLDER_PATTERN);
  const [choices, setChoices] = useState<string[]>(PLACEHOLDER_CHOICES);
  const [picked, setPicked] = useState<string | null>(null);
  const [exp, setExp] = useState(0);
  const [solved, setSolved] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [highExp, setHighExp] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);
  const [flash, setFlash] = useState<"none" | "good" | "bad">("none");
  const [shakeKey, setShakeKey] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [over, setOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  // Daily challenge state
  const [dailyOpen, setDailyOpen] = useState(false);
  const [dailyHydrated, setDailyHydrated] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyLastDate, setDailyLastDate] = useState<string | null>(null);
  const [dailyToday, setDailyToday] = useState<DailyState | null>(null);
  const [dailyPicked, setDailyPicked] = useState<string | null>(null);
  const [dailyHintUsed, setDailyHintUsed] = useState(false);

  const diff = DIFF_META[pattern.difficulty];
  const level = Math.floor(exp / LEVEL_STEP) + 1;
  const intoLevel = exp % LEVEL_STEP;
  const highLevel = Math.floor(highExp / LEVEL_STEP) + 1;

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const p = loadPersisted();
    if (typeof p.best === "number") setBest(p.best);
    if (typeof p.highExp === "number") setHighExp(p.highExp);
    if (typeof p.totalSolved === "number") setTotalSolved(p.totalSolved);
    const validFilter =
      p.filter && ["All", "Easy", "Medium", "Hard", "GATE"].includes(p.filter)
        ? (p.filter as DiffFilter)
        : "All";
    setFilter(validFilter);
    if (p.pattern && Array.isArray(p.choices) && p.choices.length > 0) {
      setPattern(p.pattern);
      setChoices(p.choices);
      if (typeof p.exp === "number") setExp(p.exp);
      if (typeof p.solved === "number") setSolved(p.solved);
      if (typeof p.streak === "number") setStreak(p.streak);
      if (typeof p.lives === "number") setLives(p.lives);
      if (typeof p.revealed === "boolean") setRevealed(p.revealed);
      if (typeof p.hintUsed === "boolean") setHintUsed(p.hintUsed);
      if (typeof p.lastGain === "number") setLastGain(p.lastGain);
    } else {
      const fresh = newPatternFiltered(validFilter);
      setPattern(fresh);
      setChoices(buildChoices(fresh));
    }
    setHydrated(true);
  }, []);

  // Persist whenever stats/settings change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    savePersisted({
      best,
      highExp,
      highLevel: Math.floor(highExp / LEVEL_STEP) + 1,
      totalSolved,
      filter,
      exp,
      solved,
      streak,
      lives,
      pattern,
      choices,
      revealed,
      hintUsed,
      lastGain,
    });
  }, [best, highExp, totalSolved, filter, hydrated, exp, solved, streak, lives, pattern, choices, revealed, hintUsed, lastGain]);

  useEffect(() => {
    if (flash === "none") return;
    const t = setTimeout(() => setFlash("none"), 500);
    return () => clearTimeout(t);
  }, [flash]);

  // Hydrate daily challenge once, rolling forward to today's puzzle
  useEffect(() => {
    const stored = loadDaily();
    const todayKey = dailyDateKey();
    let today = stored.today;
    if (!today || today.date !== todayKey) {
      const dp = getDailyLetterPattern();
      today = {
        date: todayKey,
        pattern: dp,
        choices: buildChoices(dp),
        attempted: false,
        success: false,
      };
    } else if (!Array.isArray(today.choices) || today.choices.length === 0) {
      // Backfill choices for users who saved daily state before MCQ existed
      today = { ...today, choices: buildChoices(today.pattern) };
    }
    let streak = stored.streak;
    // If user broke the chain (didn't complete yesterday and not today), reset to 0
    if (
      stored.lastCompletedDate &&
      stored.lastCompletedDate !== todayKey &&
      !isYesterday(stored.lastCompletedDate, todayKey)
    ) {
      streak = 0;
    }
    setDailyStreak(streak);
    setDailyLastDate(stored.lastCompletedDate);
    setDailyToday(today);
    setDailyHydrated(true);
  }, []);

  useEffect(() => {
    if (!dailyHydrated) return;
    saveDaily({
      streak: dailyStreak,
      lastCompletedDate: dailyLastDate,
      today: dailyToday,
    });
  }, [dailyHydrated, dailyStreak, dailyLastDate, dailyToday]);

  const dailyDone = !!dailyToday?.success;
  const dailyAttempted = !!dailyToday?.attempted;

  const submitDaily = (choice: string) => {
    if (!dailyToday || dailyAttempted || !choice) return;
    setDailyPicked(choice);
    const correct = checkAnswer(dailyToday.pattern, choice);
    const updated: DailyState = {
      ...dailyToday,
      attempted: true,
      success: correct,
    };
    setDailyToday(updated);
    if (correct) {
      const todayKey = updated.date;
      const nextStreak = isYesterday(dailyLastDate, todayKey)
        ? dailyStreak + 1
        : dailyLastDate === todayKey
          ? dailyStreak
          : 1;
      setDailyStreak(nextStreak);
      setDailyLastDate(todayKey);
      toast.success("Daily challenge solved!", {
        description: `Streak: ${nextStreak} day${nextStreak === 1 ? "" : "s"}`,
      });
    } else {
      toast("Not today — try again tomorrow", {
        description: `Answer: ${dailyToday.pattern.answer}`,
        icon: "💡",
      });
    }
  };

  const useDailyHint = () => {
    if (!dailyToday || dailyHintUsed || dailyAttempted) return;
    setDailyHintUsed(true);
    toast(dailyToday.pattern.hint, { icon: "💡" });
  };

  // Reset hint state whenever the dialog opens or the day rolls
  useEffect(() => {
    if (dailyOpen) {
      setDailyPicked(null);
      setDailyHintUsed(false);
    }
  }, [dailyOpen, dailyToday?.date]);

  const nextRound = (resetAll = false) => {
    setPattern((p) => {
      const np = newPatternFiltered(filter, p.name);
      setChoices(buildChoices(np));
      return np;
    });
    setPicked(null);
    setRevealed(false);
    setHintUsed(false);
    if (resetAll) {
      setExp(0);
      setSolved(0);
      setStreak(0);
      setLives(MAX_LIVES);
      setOver(false);
      setLastGain(0);
    }
  };

  const changeFilter = (f: DiffFilter) => {
    setFilter(f);
    setPattern((p) => {
      const np = newPatternFiltered(f, p.name);
      setChoices(buildChoices(np));
      return np;
    });
    setPicked(null);
    setRevealed(false);
    setHintUsed(false);
  };

  const submit = (choice: string) => {
    if (!choice || revealed) return;
    setPicked(choice);
    if (checkAnswer(pattern, choice)) {
      const newStreak = streak + 1;
      const base = DIFF_META[pattern.difficulty].xp;
      const bonus = Math.floor(newStreak / 3) * 5;
      const gained = base + bonus;
      setExp((s) => s + gained);
      setSolved((n) => n + 1);
      setTotalSolved((n) => n + 1);
      setLastGain(gained);
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setHighExp((h) => Math.max(h, exp + gained));
      setFlash("good");
      toast.success("Correct!", {
        description: `${pattern.difficulty} · ${pattern.name}`,
      });
      setRevealed(true);
      setTimeout(() => nextRound(), 1100);
    } else {
      setFlash("bad");
      setShakeKey((k) => k + 1);
      setStreak(0);
      const remaining = lives - 1;
      setLives(remaining);
      toast("Not quite — take a look", {
        description: `Answer: ${pattern.answer} · ${pattern.name}`,
        icon: "💡",
      });
      setRevealed(true);
      if (remaining <= 0) {
        setTimeout(() => setOver(true), 700);
      } else {
        // Wait for user to press Continue so they can absorb the answer
      }
    }
  };

  const useHint = () => {
    if (hintUsed || revealed) return;
    setHintUsed(true);
    toast(pattern.hint, { icon: "💡" });
  };

  const flashClass =
    flash === "good"
      ? "ring-4 ring-emerald-400/70 shadow-[0_0_60px_-12px_rgba(16,185,129,0.6)]"
      : flash === "bad"
        ? "ring-4 ring-rose-500/70 shadow-[0_0_60px_-12px_rgba(244,63,94,0.6)]"
        : `ring-1 ring-border`;

  const displaySeries = useMemo(
    () => [...pattern.series, revealed ? pattern.answer : "?"],
    [pattern, revealed],
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-4 sm:py-8">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-background to-fuchsia-50 dark:from-indigo-950/40 dark:via-background dark:to-fuchsia-950/40" />
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #e879f9 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto max-w-3xl">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-5 sm:gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-4xl md:text-5xl">
              Pattern Whiz
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              GATE-grade sequences. Solve → earn XP → level up.
            </p>
          </div>
          <Scoreboard exp={exp} streak={streak} lives={lives} lastGain={lastGain} level={level} intoLevel={intoLevel} />
        </header>

        <button
          type="button"
          onClick={() => setDailyOpen(true)}
          className="mb-3 flex w-full items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 p-2 text-left shadow-sm transition-all hover:border-amber-400/70 hover:shadow-md sm:mb-4 sm:rounded-2xl sm:p-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow sm:h-10 sm:w-10 sm:rounded-xl">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                Daily Challenge
                {dailyDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <Check className="h-3 w-3" /> Done
                  </span>
                )}
                {dailyAttempted && !dailyDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    Missed
                  </span>
                )}
              </div>
              <div className="hidden text-xs text-muted-foreground sm:block">
                One letter-series puzzle, every day.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-600 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-sm">
            <Flame className="h-4 w-4" />
            <span className="tabular-nums">{dailyStreak}</span>
          </div>
        </button>

        <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:mb-4 sm:gap-2">
          <span className="hidden items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:inline-flex">
            <Shuffle className="h-3 w-3" /> Difficulty
          </span>
          {(["All", "Easy", "Medium", "Hard", "GATE"] as DiffFilter[]).map((f) => {
            const active = filter === f;
            const meta = f === "All" ? null : DIFF_META[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => changeFilter(f)}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all sm:px-3 sm:py-1 ${
                  active
                    ? meta
                      ? `bg-gradient-to-r ${meta.gradient} text-white border-transparent shadow-md`
                      : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-transparent shadow-md"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        <motion.div
          key={shakeKey}
          animate={
            flash === "bad"
              ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.45 }}
          className={`relative overflow-hidden rounded-2xl border bg-card/70 p-4 shadow-2xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 md:p-8 ${flashClass}`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${diff.gradient}`}
          />
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${diff.chip}`}
            >
              <diff.icon className="h-3.5 w-3.5" />
              {diff.label}
            </span>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Solved {solved}
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-1.5 sm:mb-6 sm:gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {displaySeries.map((item, i) => {
                const isLast = i === displaySeries.length - 1;
                return (
                  <motion.div
                    key={`${pattern.name}-${solved}-${i}-${item}`}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 260 }}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 text-base font-bold tabular-nums shadow-sm transition-all sm:h-14 sm:min-w-14 sm:rounded-xl sm:px-3 sm:text-2xl md:h-16 md:min-w-16 md:text-3xl ${
                      isLast
                        ? revealed
                          ? flash === "bad"
                            ? "border-rose-500/40 bg-rose-500/15 text-rose-600"
                            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 shadow-[0_0_24px_-4px_rgba(16,185,129,0.55)]"
                          : `animate-pulse border-dashed border-primary/50 bg-gradient-to-br ${diff.gradient} text-white shadow-lg`
                        : "border-border bg-secondary/60 text-secondary-foreground"
                    }`}
                  >
                    {item}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {choices.map((c) => {
              const isPicked = picked === c;
              const isCorrect = checkAnswer(pattern, c);
              const stateClass = revealed
                ? isCorrect
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : isPicked
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-400"
                    : "border-border bg-card/40 text-muted-foreground opacity-60"
                : "border-border bg-card hover:border-primary/60 hover:bg-primary/5 active:scale-[0.98]";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => submit(c)}
                  disabled={revealed}
                  className={`h-12 rounded-xl border text-base font-bold tabular-nums shadow-sm transition-all sm:h-14 sm:text-lg ${stateClass}`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {revealed && flash === "bad" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <div className="font-semibold text-rose-600">
                  Answer: <span className="tabular-nums">{pattern.answer}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {pattern.name} — {pattern.hint}
                </div>
              </div>
              <Button
                type="button"
                onClick={() => nextRound()}
                className="h-9 shrink-0"
              >
                Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={useHint}
              disabled={hintUsed || revealed}
            >
              <Lightbulb className="mr-1.5 h-4 w-4" />
              {hintUsed ? "Hint shown" : "Show hint"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => nextRound()}
              disabled={revealed}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Skip
            </Button>
          </div>
        </motion.div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground sm:mt-5 sm:text-xs">
          Best streak: {best} · Top level: {highLevel} ({highExp} XP) · Solved all-time: {totalSolved}
        </p>
      </div>

      <Dialog open={over} onOpenChange={(o) => !o && nextRound(true)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Game over
            </DialogTitle>
            <DialogDescription>
              Level <span className="font-semibold text-foreground">{level}</span>
              {" · "}Solved: <span className="font-semibold text-foreground">{solved}</span>
              {" · "}Best streak: <span className="font-semibold text-foreground">{best}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => nextRound(true)} className="w-full">
              Play again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dailyOpen} onOpenChange={setDailyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Daily Challenge
            </DialogTitle>
            <DialogDescription>
              {dailyToday ? (
                <>
                  {new Date(dailyToday.date + "T00:00:00").toLocaleDateString(
                    undefined,
                    { weekday: "long", month: "long", day: "numeric" },
                  )}
                  {" · "}
                  <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                    <Flame className="h-3.5 w-3.5" /> {dailyStreak}-day streak
                  </span>
                </>
              ) : (
                "Loading…"
              )}
            </DialogDescription>
          </DialogHeader>

          {dailyToday && (
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {dailyToday.pattern.name}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  ...dailyToday.pattern.series,
                  dailyAttempted ? dailyToday.pattern.answer : "?",
                ].map((item, i, arr) => {
                  const isLast = i === arr.length - 1;
                  return (
                    <div
                      key={`${i}-${item}`}
                      className={`flex h-12 min-w-12 items-center justify-center rounded-xl border px-2.5 text-lg font-bold tabular-nums shadow-sm sm:h-14 sm:min-w-14 sm:text-xl ${
                        isLast
                          ? dailyAttempted
                            ? dailyDone
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600"
                              : "border-rose-500/40 bg-rose-500/15 text-rose-600"
                            : "animate-pulse border-dashed border-amber-500/60 bg-gradient-to-br from-amber-400 to-rose-500 text-white"
                          : "border-border bg-secondary/60 text-secondary-foreground"
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>

              {!dailyAttempted ? (
                <div className="grid grid-cols-2 gap-2">
                  {dailyToday.choices.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => submitDaily(c)}
                      className="h-11 rounded-xl border border-border bg-card text-base font-bold tabular-nums shadow-sm transition-all hover:border-primary/60 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className={`rounded-xl border p-3 text-sm ${
                    dailyDone
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {dailyDone ? (
                    <>Nice — see you tomorrow for the next one.</>
                  ) : (
                    <>
                      Answer was{" "}
                      <span className="font-semibold tabular-nums">
                        {dailyToday.pattern.answer}
                      </span>
                      . The streak will pick up again when you solve tomorrow's.
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={useDailyHint}
                  disabled={dailyHintUsed || dailyAttempted}
                >
                  <Lightbulb className="mr-1.5 h-4 w-4" />
                  {dailyHintUsed ? "Hint shown" : "Show hint"}
                </Button>
                <span>
                  {dailyLastDate
                    ? `Last solved: ${dailyLastDate}`
                    : "Solve to start a streak"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Scoreboard({
  exp,
  streak,
  lives,
  lastGain,
  level,
  intoLevel,
}: {
  exp: number;
  streak: number;
  lives: number;
  lastGain: number;
  level: number;
  intoLevel: number;
}) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 rounded-2xl border bg-card/70 p-3 shadow-lg backdrop-blur-xl sm:w-auto">
      <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
        <ExpCoin exp={exp} lastGain={lastGain} />
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Level</span>
          <span className="text-xl font-black tabular-nums text-violet-600">{level}</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <Stat label="Streak" value={streak} />
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Lives</span>
          <div className="flex gap-0.5">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Heart
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < lives ? "fill-rose-500 text-rose-500" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-fuchsia-500 to-violet-600"
          initial={false}
          animate={{ width: `${(intoLevel / 100) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

function ExpCoin({ exp, lastGain }: { exp: number; lastGain: number }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        key={exp}
        initial={{ rotateY: 0, scale: 1 }}
        animate={{ rotateY: 360, scale: [1, 1.15, 1] }}
        transition={{ duration: 0.6 }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-amber-900 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25),inset_0_3px_6px_rgba(255,255,255,0.6),0_4px_10px_rgba(217,119,6,0.45)]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #fde68a 0%, #fbbf24 45%, #b45309 100%)",
          border: "2px solid #f59e0b",
        }}
      >
        <span className="text-[11px] font-extrabold tracking-tighter">XP</span>
        <AnimatePresence>
          {lastGain > 0 && (
            <motion.span
              key={`gain-${exp}`}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -18 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 0.9 }}
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-600"
            >
              +{lastGain}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Experience
        </span>
        <span className="text-xl font-bold tabular-nums text-amber-600">
          {exp}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums">{value}</span>
    </div>
  );
}