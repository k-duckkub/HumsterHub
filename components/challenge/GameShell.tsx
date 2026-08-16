"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_META, type GameId } from "@/lib/games";
import { play } from "@/lib/sound";
import { XOGame } from "../games/XOGame";
import { HoopDropGame } from "../games/HoopDropGame";
import { PuzzleGame } from "../games/PuzzleGame";
import { PongGame } from "../games/PongGame";
import type { GameProps } from "../games/types";

const GAMES: Record<GameId, (p: GameProps) => React.ReactElement> = {
  xo: XOGame,
  hoop: HoopDropGame,
  puzzle: PuzzleGame,
  pong: PongGame,
};

type Props = {
  game: GameId;
  onFinish: (win: boolean) => void;
  reduced: boolean;
};

/**
 * The frame every mini game plays inside: fixed portrait box, one restart, and
 * the intro overlay. Games themselves know nothing about the challenge around
 * them — they take onFinish and call it once.
 */
export function GameShell({ game, onFinish, reduced }: Props) {
  const [intro, setIntro] = useState(true);
  // Bumping this remounts the game, which is also how every timer, listener and
  // rAF inside it gets torn down. Restarting in place would need each game to
  // reset its own world.
  const [attempt, setAttempt] = useState(0);
  const [restartsLeft, setRestartsLeft] = useState(1);

  const Game = GAMES[game];
  const meta = GAME_META[game];

  return (
    <div className="w-full">
      <div
        className="relative mx-auto aspect-9/12 w-full max-w-[520px] max-h-[66vh] overflow-hidden rounded-[26px] bg-warm-ivory shadow-[0_20px_50px_rgba(10,26,47,0.14)]"
        style={{ touchAction: "none" }}
      >
        {!intro && <Game key={attempt} onFinish={onFinish} reduced={reduced} />}

        {intro && (
          <GameIntro
            title={meta.title}
            tagline={meta.tagline}
            how={meta.how}
            reduced={reduced}
            onDone={() => setIntro(false)}
          />
        )}

        {!intro && restartsLeft > 0 && (
          <button
            type="button"
            onClick={() => {
              setRestartsLeft((n) => n - 1);
              setAttempt((n) => n + 1);
              play("click");
            }}
            aria-label="เริ่มเกมนี้ใหม่"
            className="absolute right-2.5 top-2.5 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-ink shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
              <path
                d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function GameIntro({
  title,
  tagline,
  how,
  reduced,
  onDone,
}: {
  title: string;
  tagline: string;
  how: string;
  reduced: boolean;
  onDone: () => void;
}) {
  // 0 = title card, 1–3 = the countdown, 4 = GO.
  const [step, setStep] = useState(0);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => done.current(), 350);
      return () => window.clearTimeout(t);
    }
    const beats = [900, 300, 300, 300, 300];
    const t = window.setTimeout(() => {
      if (step >= beats.length - 1) done.current();
      else setStep((s) => s + 1);
    }, beats[step]);
    return () => window.clearTimeout(t);
  }, [step, reduced]);

  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-ink/92 px-6 text-center text-white">
      {step === 0 || reduced ? (
        <div style={{ animation: "hh-mark-pop 380ms var(--ease-spring) both" }}>
          <p className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.28em] text-orange">
            Mini Game!
          </p>
          <h4 className="text-[34px] font-extrabold leading-tight tracking-[-0.01em] max-md:text-[27px]">
            {title}
          </h4>
          <p className="mt-2.5 text-[18px] font-bold text-white/90 max-md:text-[16px]">{tagline}</p>
          <p className="mt-5 inline-block rounded-full bg-white/12 px-4 py-2 text-[15px] font-semibold text-white/80">
            {how}
          </p>
        </div>
      ) : (
        <span
          key={step}
          className="text-[86px] font-extrabold leading-none"
          style={{ animation: "hh-count-in 320ms ease-out both" }}
        >
          {step < 4 ? 4 - step : "GO!"}
        </span>
      )}
    </div>
  );
}
