"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { drawQuestions, QUESTIONS, type Question } from "@/lib/questions";
import {
  ALL_GAMES, buildStages, shuffle, tierForFails, TIER_COPY,
  TIER_REWARD_BOOST, GAMES_PER_RUN, QUESTIONS_PER_RUN, TOTAL_STAGES, type GameId,
} from "@/lib/games";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { play } from "@/lib/sound";
import { rollReward, type RollResult } from "@/lib/rewards";
import { QuestionCard } from "./QuestionCard";
import { LootBox } from "./LootBox";
import { PrizeCard } from "./PrizeCard";
import { Hero } from "./Hero";
import { GameShell } from "./challenge/GameShell";

type Mode = "challenge" | "reward" | "prize";
type Phase = "playing" | "outcome";

/**
 * One session: four random questions and one random mini-game.
 *
 * The two mini games are drawn once at mount and held in state, never
 * recomputed — re-rolling them on a re-render would swap the game out from
 * under a player mid-round.
 */
export function ChallengeFlow() {
  const reduced = useReducedMotion();

  // Both draws happen after mount, never during render. This page is statically
  // prerendered, so drawing in the render pass bakes one set into the HTML that
  // the client then disagrees with at hydration.
  const [games, setGames] = useState<GameId[]>(() => ALL_GAMES.slice(0, GAMES_PER_RUN));
  const [deck, setDeck] = useState<Question[]>(() => QUESTIONS.slice(0, QUESTIONS_PER_RUN));
  const drawn = useRef(false);

  useEffect(() => {
    if (drawn.current) return;
    drawn.current = true;
    setGames(shuffle(ALL_GAMES).slice(0, GAMES_PER_RUN));
    setDeck(drawQuestions(QUESTIONS_PER_RUN));
  }, []);

  const stages = useMemo(() => buildStages(games), [games]);

  const [index, setIndex] = useState(0);
  const [fails, setFails] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastWin, setLastWin] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("challenge");
  // Rolled once, when the box is opened. Rolling during render would re-roll
  // the prize on every re-render of the screen showing it.
  const [reward, setReward] = useState<RollResult | null>(null);

  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => { list.forEach(window.clearTimeout); };
  }, []);

  const stage = stages[index];
  const tier = tierForFails(fails);
  const heroCollapsed = index > 0 || mode !== "challenge";

  const settle = useCallback(
    (win: boolean) => {
      setLastWin(win);
      setPhase("outcome");

      const nextFails = win ? fails : fails + 1;
      if (!win) {
        setFails(nextFails);
      }

      const hold = reduced ? 120 : win ? 850 : 1100;
      timers.current.push(
        window.setTimeout(() => {
          if (nextFails >= 5 || index >= stages.length - 1) setMode("reward");
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

    const win = deck[stage.slot].opts[optionIndex].score > 0;
    timers.current.push(
      window.setTimeout(() => {
        setPicked(null);
        settle(win);
      }, reduced ? 0 : 300),
    );
  };

  const live =
    mode !== "challenge"
      ? `${TIER_COPY[tier].head} ได้รับ${TIER_COPY[tier].boxName} — คลิกเพื่อเปิดกล่อง`
      : stage.kind === "question"
        ? `ด่าน ${index + 1} จาก ${TOTAL_STAGES}: ${deck[stage.slot].ask}`
        : `ด่าน ${index + 1} จาก ${TOTAL_STAGES}: มินิเกม`;

  return (
    <main className="min-h-screen bg-warm-ivory">
      <Hero collapsed={heroCollapsed} />

      <section className="relative bg-[linear-gradient(180deg,#f3dfd0_0%,#fbf6f1_16%,var(--color-warm-ivory)_100%)]">
        <div
          className={[
            "relative mx-auto flex max-w-[760px] flex-col items-center gap-3 px-5 pb-12 pt-4 max-md:px-4",
            heroCollapsed ? "min-h-screen justify-center" : "min-h-[45vh]",
          ].join(" ")}
        >
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
                  question={deck[stage.slot]}
                  index={stage.slot}
                  total={QUESTIONS_PER_RUN}
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

        {/* Under the stage rather than above it: the dots answer "how much is
            left", which is a question the player asks after reading the card,
            not before. */}
        {mode === "challenge" && (
          <div
            className="mt-1 flex items-center justify-center gap-2"
            role="status"
            aria-label={`ด่านที่ ${index + 1} จาก ${TOTAL_STAGES}`}
          >
            {stages.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={[
                  "h-2.5 rounded-full transition-all duration-300",
                  i < index
                    ? "w-2.5 bg-orange"
                    : i === index
                      ? "w-7 bg-orange"
                      : "w-2.5 bg-[#e2d5c7]",
                ].join(" ")}
              />
            ))}
          </div>
        )}

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
              onOpened={() => {
                setReward(rollReward(Math.random, TIER_REWARD_BOOST[tier]));
                setMode("prize");
              }}
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
              <p className="mt-1 text-[15px] font-extrabold text-teal">
                {TIER_COPY[tier].boost}
              </p>
              <p id="boxHint" className="anim-hint mt-2.5 text-[20px] font-extrabold tracking-[0.01em] text-orange max-md:text-[18px]">
                ✦ คลิกเพื่อเปิดกล่อง ✦
              </p>
            </div>
          </motion.div>
        )}

        {mode === "prize" && reward && (
          <PrizeCard
            reduced={reduced}
            reward={reward}
            onLater={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
          />
        )}

          <p className="sr-only" role="status" aria-live="polite">{live}</p>
        </div>
      </section>
    </main>
  );
}
