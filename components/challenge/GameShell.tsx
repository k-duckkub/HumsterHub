"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_META, type GameId } from "@/lib/games";
import { play } from "@/lib/sound";
import { XOGame } from "../games/XOGame";
import { HoopDropGame } from "../games/HoopDropGame";
import { PuzzleGame } from "../games/PuzzleGame";
import { PongGame } from "../games/PongGame";
import { MemoryGame } from "../games/MemoryGame";
import type { GameProps } from "../games/types";

const GAMES: Record<GameId, (p: GameProps) => React.ReactElement> = {
  memory: MemoryGame,
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
  const [intro, setIntro] = useState(game !== "memory");
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
        className={`relative mx-auto w-full overflow-hidden rounded-[28px] border border-black/[0.05] bg-white ${game === "memory" ? "max-w-[620px] shadow-[0_12px_40px_rgba(0,0,0,0.045)]" : "aspect-9/12 max-w-[520px] max-h-[66vh] shadow-[0_22px_65px_rgba(0,0,0,0.10)]"}`}
        style={{ touchAction: game === "memory" ? "pan-y" : "none" }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-px z-[2] rounded-[29px] border border-white/70" />
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
            className={`absolute right-4 top-4 z-[5] grid h-10 w-10 place-items-center rounded-full text-[#6e6e73] transition-transform duration-200 hover:bg-[#ededf0] active:scale-95 ${game === "memory" ? "bg-[#f5f5f7]" : "border border-black/[0.05] bg-white/88 shadow-[0_6px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl"}`}
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
    <div className="absolute inset-0 z-10 flex flex-col justify-between overflow-hidden bg-[#fff8f3] px-8 py-8 text-left text-[#1d1d1f] max-md:px-6 max-md:py-7">
      <div className="flex items-center justify-between border-b border-black/[0.07] pb-4 text-[13px] font-semibold text-[#86868b]">
        <span>มินิเกม</span>
        <span>ด่านที่ 3 จาก 5</span>
      </div>
      {step === 0 || reduced ? (
        <div className="my-auto flex flex-col items-center text-center" style={{ animation: "hh-mark-pop 380ms var(--ease-spring) both" }}>
          <p className="mb-4 text-[15px] font-semibold text-orange">
            Skill challenge
          </p>
          <h4 className="max-w-[390px] text-[39px] font-bold leading-[1.08] tracking-[-0.04em] max-md:text-[31px]">
            {title}
          </h4>
          <p className="mt-4 max-w-[360px] text-[18px] font-medium leading-relaxed text-[#6e6e73] max-md:text-[16px]">{tagline}</p>
        </div>
      ) : (
        <div
          key={step}
          className="my-auto grid place-items-center"
          style={{ animation: "hh-count-in 320ms ease-out both" }}
        >
          <span className="text-[96px] font-semibold leading-none tracking-[-0.06em] text-orange">{step < 4 ? 4 - step : "GO"}</span>
        </div>
      )}
      <div className="flex items-center gap-3 border-t border-black/[0.07] pt-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ffe5d0] text-[14px] font-semibold text-orange-dark">i</span>
        <p className="text-[14px] font-medium text-[#6e6e73]">{how}</p>
      </div>
    </div>
  );
}
