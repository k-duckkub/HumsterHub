"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sound";
import type { GameProps } from "./types";

type Mark = "X" | "O" | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const CORNERS = [0, 2, 6, 8];

function winnerOf(b: Mark[]): { mark: Mark; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line };
  }
  return null;
}

/**
 * Medium, deliberately. A minimax opponent never loses, which would put a
 * guaranteed fail in the middle of a flow whose whole point is that most
 * players get through. This one wins when handed a win and blocks an obvious
 * loss, and is beatable by a fork.
 */
function aiMove(b: Mark[]): number {
  const free = b.reduce<number[]>((acc, v, i) => (v === null ? [...acc, i] : acc), []);

  const decisive = (mark: Mark) => {
    for (const i of free) {
      const t = b.slice();
      t[i] = mark;
      if (winnerOf(t)?.mark === mark) return i;
    }
    return null;
  };

  const takeWin = decisive("O");
  if (takeWin !== null) return takeWin;

  const block = decisive("X");
  if (block !== null) return block;

  if (b[4] === null) return 4;

  const corners = CORNERS.filter((i) => b[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  return free[Math.floor(Math.random() * free.length)];
}

export function XOGame({ onFinish, reduced }: GameProps) {
  const [board, setBoard] = useState<Mark[]>(() => Array(9).fill(null));
  const [thinking, setThinking] = useState(false);
  const [line, setLine] = useState<number[] | null>(null);
  const [wobble, setWobble] = useState(false);
  const [over, setOver] = useState(false);

  const settled = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => { list.forEach(window.clearTimeout); };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 60) : ms));
  };

  const settle = (win: boolean, winning: number[] | null) => {
    if (settled.current) return;
    settled.current = true;
    setOver(true);
    setLine(winning);
    if (!win) setWobble(true);
    play(win ? "win" : "lose");
    later(() => onFinish(win), 820);
  };

  const pick = (i: number) => {
    if (settled.current || thinking || board[i]) return;

    const next = board.slice();
    next[i] = "X";
    setBoard(next);
    play("place");

    const mine = winnerOf(next);
    if (mine) return settle(true, mine.line);
    // A draw counts as surviving. Tic tac toe draws constantly, and scoring it
    // as a miss would soak the hamster for playing correctly.
    if (next.every(Boolean)) return settle(true, null);

    setThinking(true);
    later(() => {
      const after = next.slice();
      after[aiMove(next)] = "O";
      setBoard(after);
      setThinking(false);
      play("place");

      const theirs = winnerOf(after);
      if (theirs) return settle(false, theirs.line);
      if (after.every(Boolean)) return settle(true, null);
    }, 420);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
      <p className="text-center text-[15px] font-bold text-ink/70">
        {over ? " " : thinking ? "AI กำลังคิด…" : "ตาคุณ — แตะช่องว่างเพื่อวาง ✕"}
      </p>

      <div
        className={[
          "grid aspect-square w-full max-w-[380px] grid-cols-3 gap-2.5 rounded-[22px] bg-ink p-2.5",
          wobble ? "animate-[hh-shiver_600ms_ease-in-out_1]" : "",
        ].join(" ")}
        style={{ transformBox: "fill-box" }}
      >
        {board.map((mark, i) => {
          const inLine = line?.includes(i) ?? false;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={mark !== null || thinking || over}
              aria-label={`ช่องที่ ${i + 1}${mark ? ` มี ${mark}` : " ว่าง"}`}
              className={[
                "relative grid place-items-center rounded-[14px] transition-colors duration-200",
                inLine ? "bg-[#fff5e2]" : "bg-warm-ivory",
                mark === null && !thinking && !over
                  ? "cursor-pointer hover:bg-white active:scale-[0.97]"
                  : "cursor-default",
              ].join(" ")}
            >
              {inLine && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[14px] ring-4 ring-orange"
                  style={{ animation: "hh-line-glow 900ms ease-in-out infinite" }}
                />
              )}
              {mark && (
                <svg
                  viewBox="0 0 40 40"
                  className="h-[62%] w-[62%]"
                  style={{ animation: "hh-mark-pop 260ms var(--ease-spring) both" }}
                  aria-hidden
                >
                  {mark === "X" ? (
                    <path
                      d="M10 10l20 20M30 10L10 30"
                      stroke="#FF6B00"
                      strokeWidth="7.5"
                      strokeLinecap="round"
                    />
                  ) : (
                    <circle cx="20" cy="20" r="12" stroke="#2C9FA2" strokeWidth="7.5" fill="none" />
                  )}
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
