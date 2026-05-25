import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Heart, Lightbulb, RotateCcw, Sparkles, Trophy, Zap, Flame, GraduationCap, Shuffle } from "lucide-react";
import { newPatternFiltered, checkAnswer, type Pattern, type Difficulty } from "@/lib/patterns";

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
  const [pattern, setPattern] = useState<Pattern>(() => newPatternFiltered("All"));
  const [input, setInput] = useState("");
  const [exp, setExp] = useState(0);
  const [solved, setSolved] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [flash, setFlash] = useState<"none" | "good" | "bad">("none");
  const [shakeKey, setShakeKey] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [over, setOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const diff = DIFF_META[pattern.difficulty];
  const level = Math.floor(exp / LEVEL_STEP) + 1;
  const intoLevel = exp % LEVEL_STEP;

  useEffect(() => {
    if (flash === "none") return;
    const t = setTimeout(() => setFlash("none"), 500);
    return () => clearTimeout(t);
  }, [flash]);

  const nextRound = (resetAll = false) => {
    setPattern((p) => newPatternFiltered(filter, p.name));
    setInput("");
    setRevealed(false);
    setHintUsed(false);
    if (resetAll) {
      setExp(0);
      setSolved(0);
      setStreak(0);
      setLives(3);
      setOver(false);
      setLastGain(0);
    }
  };

  const changeFilter = (f: DiffFilter) => {
    setFilter(f);
    setPattern((p) => newPatternFiltered(f, p.name));
    setInput("");
    setRevealed(false);
    setHintUsed(false);
  };

  const submit = () => {
    if (!input.trim() || revealed) return;
    if (checkAnswer(pattern, input)) {
      const newStreak = streak + 1;
      const base = DIFF_META[pattern.difficulty].xp;
      const bonus = Math.floor(newStreak / 3) * 5;
      const gained = base + bonus;
      setExp((s) => s + gained);
      setSolved((n) => n + 1);
      setLastGain(gained);
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setFlash("good");
      toast.success("Correct!", {
        description: `${pattern.difficulty} · ${pattern.name}`,
      });
      setRevealed(true);
      setTimeout(() => nextRound(), 900);
    } else {
      setFlash("bad");
      setShakeKey((k) => k + 1);
      setStreak(0);
      const remaining = lives - 1;
      setLives(remaining);
      toast.error("Not quite", {
        description: `Answer was ${pattern.answer} — ${pattern.name}`,
      });
      setRevealed(true);
      if (remaining <= 0) {
        setTimeout(() => setOver(true), 700);
      } else {
        setTimeout(() => nextRound(), 1500);
      }
    }
  };

  const useHint = () => {
    if (hintUsed || revealed) return;
    setHintUsed(true);
    setStreak(0);
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
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
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
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-fuchsia-600">
              <Sparkles className="h-3 w-3" /> Aptitude trainer
            </div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-5xl">
              Pattern Whiz
            </h1>
            <p className="text-sm text-muted-foreground">
              GATE-grade sequences. Solve → earn XP → level up.
            </p>
          </div>
          <Scoreboard exp={exp} streak={streak} lives={lives} lastGain={lastGain} level={level} intoLevel={intoLevel} />
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
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
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
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
          className={`relative overflow-hidden rounded-3xl border bg-card/70 p-6 shadow-2xl backdrop-blur-xl transition-all md:p-10 ${flashClass}`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${diff.gradient}`}
          />
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${diff.chip}`}
            >
              <diff.icon className="h-3.5 w-3.5" />
              {diff.label}
            </span>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>Solved {solved}</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" /> {streak}
              </span>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {displaySeries.map((item, i) => {
                const isLast = i === displaySeries.length - 1;
                return (
                  <motion.div
                    key={`${pattern.name}-${solved}-${i}-${item}`}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 260 }}
                    className={`flex h-12 min-w-12 items-center justify-center rounded-xl border px-2.5 text-lg font-bold tabular-nums shadow-sm transition-all sm:h-16 sm:min-w-16 sm:rounded-2xl sm:px-4 sm:text-2xl md:h-20 md:min-w-20 md:text-3xl ${
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your answer…"
              className="h-12 text-lg"
              disabled={revealed}
            />
            <Button type="submit" className="h-12 px-6 text-base" disabled={revealed}>
              Submit
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={useHint}
              disabled={hintUsed || revealed}
            >
              <Lightbulb className="mr-1.5 h-4 w-4" />
              {hintUsed ? "Hint shown" : "Hint (resets streak)"}
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

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Best streak: {best} · Mix of arithmetic, algebraic, recurrence, prime &amp; alphanumeric series.
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
    <div className="flex flex-col items-stretch gap-2 rounded-2xl border bg-card/70 p-3 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-4">
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
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${
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