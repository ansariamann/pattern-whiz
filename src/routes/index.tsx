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
import { Heart, Lightbulb, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { newPattern, checkAnswer, type Pattern } from "@/lib/patterns";

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
  const [pattern, setPattern] = useState<Pattern>(() => newPattern());
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

  useEffect(() => {
    if (flash === "none") return;
    const t = setTimeout(() => setFlash("none"), 500);
    return () => clearTimeout(t);
  }, [flash]);

  const nextRound = (resetAll = false) => {
    setPattern((p) => newPattern(p.name));
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

  const submit = () => {
    if (!input.trim() || revealed) return;
    if (checkAnswer(pattern, input)) {
      const newStreak = streak + 1;
      const gained = 10 + Math.floor(newStreak / 3) * 5;
      setExp((s) => s + gained);
      setSolved((n) => n + 1);
      setLastGain(gained);
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setFlash("good");
      toast.success(`Correct! +${gained} XP`, {
        description: `Pattern: ${pattern.name}`,
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
      ? "ring-4 ring-emerald-400/60"
      : flash === "bad"
        ? "ring-4 ring-rose-500/60"
        : "ring-1 ring-border";

  const displaySeries = useMemo(
    () => [...pattern.series, revealed ? pattern.answer : "?"],
    [pattern, revealed],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/40 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Pattern Whiz
            </h1>
            <p className="text-sm text-muted-foreground">
              Competitive-exam style sequences. Earn XP coins for every solve.
            </p>
          </div>
          <Scoreboard exp={exp} streak={streak} lives={lives} lastGain={lastGain} />
        </header>

        <motion.div
          key={shakeKey}
          animate={
            flash === "bad"
              ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.45 }}
          className={`rounded-3xl border bg-card p-6 shadow-xl transition-all md:p-10 ${flashClass}`}
        >
          <div className="mb-4 flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Solved {solved}
            </span>
            <span>Streak {streak}</span>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {displaySeries.map((item, i) => {
                const isLast = i === displaySeries.length - 1;
                return (
                  <motion.div
                    key={`${pattern.name}-${solved}-${i}-${item}`}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 260 }}
                    className={`flex h-16 min-w-16 items-center justify-center rounded-2xl px-4 text-2xl font-semibold md:h-20 md:min-w-20 md:text-3xl ${
                      isLast
                        ? revealed
                          ? flash === "bad"
                            ? "bg-rose-500/15 text-rose-600"
                            : "bg-emerald-500/15 text-emerald-600"
                          : "animate-pulse bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
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
          Best streak: {best} · Every puzzle is a fresh pattern — arithmetic, algebraic, alphanumeric and more.
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
              Total XP: <span className="font-semibold text-foreground">{exp}</span>
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
}: {
  exp: number;
  streak: number;
  lives: number;
  lastGain: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card px-4 py-2 shadow-sm">
      <ExpCoin exp={exp} lastGain={lastGain} />
      <div className="h-8 w-px bg-border" />
      <Stat label="Streak" value={streak} />
      <div className="h-8 w-px bg-border" />
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lives
        </span>
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