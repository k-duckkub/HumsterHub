"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS } from "@/lib/questions";
import { ALL_GAMES, buildStages, shuffle, tierForFails, TIER_COPY, TOTAL_STAGES, type GameId } from "@/lib/games";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSound, play } from "@/lib/sound";
import { QuestionCard } from "./QuestionCard";
import { LootBox } from "./LootBox";
import { PrizeCard } from "./PrizeCard";
import { Hero } from "./Hero";
import { HamsterShower } from "./challenge/HamsterShower";
import { GameShell } from "./challenge/GameShell";

type Mode = "challenge" | "reward" | "prize";
type Phase = "playing" | "outcome";

/**
 * One session, five encounters, one hamster getting progressively wetter.
 *
 * The two mini games are drawn once at mount and held in state, never
 * recomputed — re-rolling them on a re-render would swap the game out from
 * under a player mid-round.
 */
export function ChallengeFlow() {
  const reduced = useReducedMotion();
  const { enabled: soundOn, toggle: toggleSound } = useSound();

  // Drawn after mount, not during render. This page is statically prerendered,
  // so a draw in the render pass would bake one pair into the HTML and then
  // disagree with the client's own draw at hydration. The placeholder is never
  // seen because stage 0 is always a question.
  const [games, setGames] = useState<GameId[]>(() => ALL_GAMES.slice(0, 2));
  const drawn = useRef(false);
  useEffect(() => {
    if (drawn.current) return;
    drawn.current = true;
    setGames(shuffle(ALL_GAMES).slice(0, 2));
  }, []);

  const stages = useMemo(() => buildStages(games), [games]);

  const [index, setIndex] = useState(0);
  const [fails, setFails] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastWin, setLastWin] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("challenge");

  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => { list.forEach(window.clearTimeout); };
  }, []);

  const stage = stages[index];
  const tier = tierForFails(fails);

  const settle = useCallback(
    (win: boolean) => {
      setLastWin(win);
      setPhase("outcome");

      const nextFails = win ? fails : fails + 1;
      if (!win) {
        setFails(nextFails);
        // The shower only actually turns on at level 4; before that it is a
        // pipe and a nozzle, and a splash sound would be a lie.
        if (nextFails >= 4) play("water");
      }

      // A miss holds longer than a hit: the brief asks for the fail build-up to
      // be seen before the next encounter starts.
      const hold = reduced ? 120 : win ? 850 : 1350;
      timers.current.push(
        window.setTimeout(() => {
          if (index >= stages.length - 1) setMode("reward");
          else {
            setIndex((i) => i + 1);
            setPhase("playing");
          }
        }, hold),
      );
    },
    [fails, index, reduced, stages.length],
  );

  const pickOption = (optionIndex: number) => {
    if (picked !== null || phase !== "playing" || stage.kind !== "question") return;
    setPicked(optionIndex);
    play("click");

    const win = QUESTIONS[stage.questionIndex].opts[optionIndex].score > 0;
    timers.current.push(
      window.setTimeout(() => {
        setPicked(null);
        settle(win);
      }, reduced ? 0 : 300),
    );
  };

  const inGame = mode === "challenge" && stage.kind === "game";
  const live =
    mode !== "challenge"
      ? `${TIER_COPY[tier].head} ได้รับ${TIER_COPY[tier].boxName} — คลิกเพื่อเปิดกล่อง`
      : stage.kind === "question"
        ? `ด่าน ${index + 1} จาก ${TOTAL_STAGES}: ${QUESTIONS[stage.questionIndex].ask}`
        : `ด่าน ${index + 1} จาก ${TOTAL_STAGES}: มินิเกม`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_34%,#ffffff_0%,var(--color-warm-ivory)_75%)]">
      <Hero collapsed={index > 0 || mode !== "challenge"} />

      <section className="relative mx-auto flex max-w-[760px] flex-col items-center gap-3 px-5 pb-12 pt-4 max-md:px-4">
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2" aria-label={`ด่านที่ ${index + 1} จาก ${TOTAL_STAGES}`}>
            {stages.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={[
                  "h-2.5 rounded-full transition-all duration-300",
                  mode !== "challenge" || i < index
                    ? "w-2.5 bg-orange"
                    : i === index
                      ? "w-7 bg-orange"
                      : "w-2.5 bg-[#e2d5c7]",
                ].join(" ")}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "ปิดเสียง" : "เปิดเสียง"}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-[0_4px_14px_rgba(10,26,47,0.10)] transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
              <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
              {soundOn ? (
                <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </header>

        {mode === "challenge" && (
          <HamsterShower level={fails} compact={inGame && phase === "playing"} />
        )}

        <div className="relative flex w-full flex-col items-center">
          <AnimatePresence mode="wait">
            {mode === "challenge" && stage.kind === "question" && (
              <motion.div
                key={`q-${index}`}
                initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[620px]"
              >
                <QuestionCard
                  question={QUESTIONS[stage.questionIndex]}
                  index={stage.questionIndex}
                  total={QUESTIONS.length}
                  picked={picked}
                  onPick={pickOption}
                  reduced={reduced}
                />
              </motion.div>
            )}

            {mode === "challenge" && stage.kind === "game" && (
              <motion.div
                key={`g-${index}`}
                initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <GameShell game={stage.game} onFinish={settle} reduced={reduced} />
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "challenge" && phase === "outcome" && (
            <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
              <span
                className={[
                  "rounded-[18px] px-7 py-4 text-[26px] font-extrabold text-white shadow-[0_16px_40px_rgba(10,26,47,0.28)] max-md:text-[21px]",
                  lastWin ? "bg-teal" : "bg-[#e0552f]",
                ].join(" ")}
                style={{ animation: "hh-mark-pop 360ms var(--ease-spring) both" }}
              >
                {lastWin ? "ผ่าน! ✦" : "โอ๊ะ พลาดแล้ว!"}
              </span>
            </div>
          )}
        </div>

        {mode !== "challenge" && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 26, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full max-w-[620px] text-center ${mode === "prize" ? "mb-[18px]" : ""}`}
          >
            {/* The tier headline has done its job once the reward card is up —
                two headings on screen compete. */}
            <div
              className={[
                "overflow-hidden transition-[opacity,max-height,margin] duration-[450ms]",
                mode === "prize" ? "m-0 max-h-0 opacity-0" : "max-h-[260px] opacity-100",
              ].join(" ")}
            >
              <h3 className="mb-1.5 text-[40px] font-extrabold tracking-[-0.02em] max-md:text-[30px]">
                {TIER_COPY[tier].head}
              </h3>
              <p className="mb-1.5 text-[19px] text-slate-body max-md:text-[17px]">
                {TIER_COPY[tier].sub}
              </p>
            </div>

            <LootBox
              kind={tier}
              compact={mode === "prize"}
              reduced={reduced}
              onOpened={() => setMode("prize")}
            />

            <div
              className={[
                "overflow-hidden transition-[opacity,max-height,margin] duration-[450ms]",
                mode === "prize" ? "m-0 max-h-0 opacity-0" : "max-h-[160px] opacity-100",
              ].join(" ")}
            >
              <p className="mt-1 text-[18px] font-semibold">
                คุณได้รับ{TIER_COPY[tier].boxName}
              </p>
              <p id="boxHint" className="anim-hint mt-2.5 text-[20px] font-extrabold tracking-[0.01em] text-orange max-md:text-[18px]">
                ✦ คลิกเพื่อเปิดกล่อง ✦
              </p>
            </div>
          </motion.div>
        )}

        {mode === "prize" && (
          <PrizeCard
            reduced={reduced}
            onLater={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
          />
        )}

        <p className="sr-only" role="status" aria-live="polite">{live}</p>
      </section>
    </main>
  );
}
