"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { play } from "@/lib/sound";
import type { GameProps } from "./types";

const N = 3;
const CELLS = N * N;
const BLANK = CELLS - 1;
const LIMIT = 42;
const GUIDE_AFTER = 15;

/** Camp artwork, cut into an N×N grid by background-position. The grid keeps
 *  the source aspect ratio so the picture is never squashed. */
const IMAGE = "/assets/banner-scigamelab.webp";
const IMAGE_ASPECT = "1425 / 762";

const rowOf = (slot: number) => Math.floor(slot / N);
const colOf = (slot: number) => slot % N;

const adjacent = (a: number, b: number) =>
  (rowOf(a) === rowOf(b) && Math.abs(colOf(a) - colOf(b)) === 1) ||
  (colOf(a) === colOf(b) && Math.abs(rowOf(a) - rowOf(b)) === 1);

/**
 * Shuffled by walking the blank through random legal moves rather than by
 * permuting the array. Half of all permutations of a sliding puzzle are
 * unreachable, so a random permutation is a coin flip on whether the board can
 * be solved at all.
 */
function scramble(): number[] {
  let slots = Array.from({ length: CELLS }, (_, i) => i);

  for (let attempt = 0; attempt < 4; attempt++) {
    slots = Array.from({ length: CELLS }, (_, i) => i);
    let blank = CELLS - 1;
    let previous = -1;

    for (let i = 0; i < 30; i++) {
      const options = slots
        .map((_, slot) => slot)
        .filter((slot) => adjacent(slot, blank) && slot !== previous);
      const pick = options[Math.floor(Math.random() * options.length)];
      [slots[pick], slots[blank]] = [slots[blank], slots[pick]];
      previous = blank;
      blank = pick;
    }

    // 30 moves lands back on solved rarely, but "rarely" over a whole camp's
    // worth of players is often enough to be worth one retry.
    if (slots.some((tile, slot) => tile !== slot)) break;
  }

  return slots;
}

export function PuzzleGame({ onFinish, reduced }: GameProps) {
  const [slots, setSlots] = useState<number[]>(scramble);
  const [left, setLeft] = useState(LIMIT);
  const [solved, setSolved] = useState(false);

  const finished = useRef(false);
  const endTimer = useRef<number | undefined>(undefined);

  const finish = useCallback(
    (win: boolean) => {
      if (finished.current) return;
      finished.current = true;
      setSolved(win);
      play(win ? "win" : "lose");
      endTimer.current = window.setTimeout(() => onFinish(win), reduced ? 60 : win ? 950 : 700);
    },
    [onFinish, reduced],
  );

  useEffect(() => {
    const id = window.setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Reacting to the clock hitting zero rather than calling finish() from inside
  // the updater — updaters run twice under StrictMode and must stay pure.
  useEffect(() => {
    if (left === 0) finish(false);
  }, [left, finish]);

  useEffect(() => () => window.clearTimeout(endTimer.current), []);

  const move = (slot: number) => {
    if (finished.current) return;
    const blank = slots.indexOf(BLANK);
    if (!adjacent(slot, blank)) return;

    const next = slots.slice();
    [next[slot], next[blank]] = [next[blank], next[slot]];
    setSlots(next);
    play("click");

    if (next.every((tile, i) => tile === i)) finish(true);
  };

  const showGuide = left <= LIMIT - GUIDE_AFTER;
  const urgent = left <= 10;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
      <div className="flex w-full max-w-[360px] items-center justify-between text-[15px] font-extrabold">
        <span className="text-ink/70">เรียงภาพให้ครบ</span>
        <span
          className={[
            "rounded-full px-3 py-1 tabular-nums transition-colors",
            urgent ? "bg-[#ffe3e0] text-[#d8391f]" : "bg-warm-ivory text-ink",
          ].join(" ")}
        >
          ⏱ {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
        </span>
      </div>

      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-[18px] bg-ink p-1.5"
        style={{ aspectRatio: IMAGE_ASPECT }}
      >
        {/* Faint whole picture behind the tiles once the clock has run a while.
            Younger players stall on "what am I even building". */}
        <div
          aria-hidden
          className="absolute inset-1.5 rounded-[13px] bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${IMAGE})`, opacity: showGuide && !solved ? 0.11 : 0 }}
        />

        <div className="relative h-full w-full">
          {Array.from({ length: CELLS }, (_, tile) => tile)
            .filter((tile) => tile !== BLANK || solved)
            .map((tile) => {
              const slot = slots.indexOf(tile);
              return (
                <button
                  key={tile}
                  type="button"
                  onClick={() => move(slot)}
                  disabled={solved || finished.current}
                  aria-label={`แผ่นที่ ${tile + 1}`}
                  className={[
                    "absolute left-0 top-0 overflow-hidden bg-cover",
                    "transition-[transform,border-radius,padding] duration-200 ease-[var(--ease-out-soft)]",
                    solved ? "rounded-none" : "rounded-[9px]",
                  ].join(" ")}
                  style={{
                    width: `${100 / N}%`,
                    height: `${100 / N}%`,
                    transform: `translate(${colOf(slot) * 100}%, ${rowOf(slot) * 100}%)`,
                    backgroundImage: `url(${IMAGE})`,
                    backgroundSize: `${N * 100}% ${N * 100}%`,
                    backgroundPosition: `${(colOf(tile) * 100) / (N - 1)}% ${(rowOf(tile) * 100) / (N - 1)}%`,
                    // A hairline gap while playing so the pieces read as pieces;
                    // it closes on the win and the picture becomes whole.
                    outline: solved ? "none" : "2px solid #0A1A2F",
                    outlineOffset: "-1px",
                  }}
                />
              );
            })}
        </div>

        {solved && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[18px] ring-4 ring-orange"
            style={{ animation: "hh-mark-pop 420ms var(--ease-spring) both" }}
          />
        )}
      </div>

      <p className="text-center text-[14px] font-bold text-ink/60">
        {solved ? "เรียงครบแล้ว!" : "แตะแผ่นที่ติดกับช่องว่าง"}
      </p>
    </div>
  );
}
