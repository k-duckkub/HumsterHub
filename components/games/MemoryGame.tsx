"use client";

import { useEffect, useReducer, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { shuffle } from "@/lib/games";
import { play } from "@/lib/sound";
import type { GameProps } from "./types";
import styles from "./MemoryGame.module.css";

type SymbolId = "hamster" | "coin" | "letter" | "gem";
type Phase = "ready" | "memorize" | "playing" | "won" | "lost";
type State = {
  deck: SymbolId[];
  phase: Phase;
  open: number[];
  matched: number[];
  moves: number;
  seconds: number;
};
type Action =
  | { type: "start"; deck: SymbolId[] }
  | { type: "play" }
  | { type: "pick"; index: number }
  | { type: "resolve" }
  | { type: "tick" };

const SYMBOLS: SymbolId[] = ["hamster", "coin", "letter", "gem"];
const LABELS: Record<SymbolId, string> = {
  hamster: "แฮมสเตอร์", coin: "เหรียญ", letter: "จดหมาย", gem: "อัญมณี",
};
const INITIAL: State = {
  deck: [...SYMBOLS, ...SYMBOLS], phase: "ready", open: [], matched: [], moves: 0, seconds: 45,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return state.phase === "ready" ? { ...INITIAL, deck: action.deck, phase: "memorize" } : state;
    case "play":
      return state.phase === "memorize" ? { ...state, phase: "playing" } : state;
    case "pick": {
      const i = action.index;
      if (state.phase !== "playing" || state.open.length >= 2 || state.open.includes(i) || state.matched.includes(i)) return state;
      return { ...state, open: [...state.open, i], moves: state.moves + (state.open.length === 1 ? 1 : 0) };
    }
    case "resolve": {
      if (state.phase !== "playing" || state.open.length !== 2) return state;
      const [a, b] = state.open;
      const matched = state.deck[a] === state.deck[b] ? [...state.matched, a, b] : state.matched;
      return { ...state, open: [], matched, phase: matched.length === 8 ? "won" : "playing" };
    }
    case "tick":
      if (state.phase !== "playing") return state;
      // Allow a final correct pair to finish its reveal even on the last tick.
      if (state.matched.length === 6 && state.open.length === 2 && state.deck[state.open[0]] === state.deck[state.open[1]]) return state;
      return { ...state, seconds: Math.max(0, state.seconds - 1), phase: state.seconds <= 1 ? "lost" : "playing" };
  }
}

export function MemoryGame({ onFinish, reduced }: GameProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const finish = useRef(onFinish);
  const reported = useRef(false);
  useEffect(() => { finish.current = onFinish; }, [onFinish]);

  useEffect(() => {
    if (state.phase !== "memorize") return;
    const timer = window.setTimeout(() => dispatch({ type: "play" }), 3000);
    return () => window.clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const timer = window.setInterval(() => {
      if (!document.hidden) dispatch({ type: "tick" });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "playing" || state.open.length !== 2) return;
    const match = state.deck[state.open[0]] === state.deck[state.open[1]];
    const timer = window.setTimeout(() => {
      play(match ? "pair" : "miss");
      dispatch({ type: "resolve" });
    }, match ? 640 : 1120);
    return () => window.clearTimeout(timer);
  }, [state.open, state.deck, state.phase]);

  useEffect(() => {
    if (state.phase !== "won" && state.phase !== "lost") return;
    const win = state.phase === "won";
    play(win ? "win" : "lose");
    const timer = window.setTimeout(() => {
      if (reported.current) return;
      reported.current = true;
      finish.current(win);
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [state.phase]);

  const ended = state.phase === "won" || state.phase === "lost";
  const pairs = state.matched.length / 2;
  const mismatch = state.open.length === 2 && state.deck[state.open[0]] !== state.deck[state.open[1]];
  const message = state.phase === "ready" ? "ดูภาพ 3 วินาที ก่อนเริ่มจับเวลา"
    : state.phase === "memorize" ? "จำตำแหน่งไว้ พร้อมแล้วค่อยหาคู่"
    : state.phase === "won" ? "ครบทุกคู่แล้ว เก่งมาก!"
    : state.phase === "lost" ? "หมดเวลาแล้ว ไม่เป็นไรนะ"
    : state.open.length === 2 ? (mismatch ? "ยังไม่ใช่คู่นี้ จำตำแหน่งไว้ก่อนนะ" : "ใช่เลย คู่นี้คู่กัน!")
    : state.open.length === 1 ? "อีกใบอยู่ตรงไหนนะ?" : pairs > 0 ? `เจอแล้ว ${pairs} คู่ อีกนิดเดียว` : "แตะสองใบ เพื่อหาภาพที่เหมือนกัน";

  return (
    <div className={styles.game} data-phase={state.phase} data-reduced={reduced || undefined}>
      <header className={styles.header}>
        <h2>จับคู่ภาพ</h2>
        <p className={styles.description}>จับคู่ให้ครบ 4 คู่ ภายใน 45 วินาที</p>
      </header>

      <div className={styles.stats}>
        <div className={styles.pairs} aria-label={`จับคู่ได้ ${pairs} จาก 4 คู่`}>
          <span className={styles.statLabel}>จับคู่สำเร็จ</span>
          <span className={styles.pairCount}><b>{pairs}</b><span>/ 4 คู่</span></span>
        </div>
        <div className={styles.timerBlock}>
          <span className={styles.statLabel}>{state.phase === "ready" ? "เวลาเล่น" : state.phase === "memorize" ? "จำภาพก่อนเริ่ม" : "เวลาที่เหลือ"}</span>
          <span className={styles.clock} data-urgent={state.seconds <= 10 || undefined} aria-label={state.phase === "memorize" ? "ช่วงจำภาพ 3 วินาที" : `เหลือ ${state.seconds} วินาที`}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="13" r="7.5" /><path d="M9 2h6M12 6V3m0 7v4l2 1" /></svg>
            <span>{state.phase === "memorize" ? "3 วินาที" : `00:${String(state.seconds).padStart(2, "0")}`}</span>
          </span>
          <div className={styles.timeTrack} aria-hidden>
            {state.phase === "memorize" ? <span key="preview" className={styles.previewTime} /> : <span key="play" style={{ transform: `scaleX(${state.seconds / 45})` }} />}
          </div>
        </div>
      </div>

      <div className={styles.boardWrap}>
      <div className={styles.board} role="group" aria-label="การ์ดจับคู่ 8 ใบ">
        {state.deck.map((symbol, i) => {
          const matched = state.matched.includes(i);
          const revealed = matched || state.open.includes(i) || state.phase === "memorize" || ended;
          return (
            <button
              key={i}
              type="button"
              className={styles.card}
              data-revealed={revealed || undefined}
              data-matched={matched || undefined}
              data-mismatch={mismatch && state.open.includes(i) || undefined}
              style={{ "--order": i } as CSSProperties}
              disabled={state.phase !== "playing" || state.open.length >= 2 || revealed}
              aria-label={`การ์ด ${i + 1}${revealed ? ` ${LABELS[symbol]}${matched ? " จับคู่แล้ว" : ""}` : " ยังไม่เปิด"}`}
              onClick={() => { dispatch({ type: "pick", index: i }); play("cardFlip"); }}
            >
              <span className={styles.cardInner}>
                <span className={styles.cardBack} aria-hidden>
                  <svg viewBox="0 0 32 32" fill="none" className={styles.backIcon}>
                    <rect x="4.5" y="8" width="23" height="17" rx="3.5" />
                    <path d="m5.5 9.5 9 7a2.5 2.5 0 0 0 3 0l9-7" />
                  </svg>
                </span>
                <span className={styles.cardFace} aria-hidden>
                  <span className={styles.symbolTile}><MemorySymbol kind={symbol} /></span>
                  <span className={styles.cardLabel}>{LABELS[symbol]}</span>
                  {matched && <span className={styles.check}>✓</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {ended && <div className={styles.result} role="status">
        <span className={styles.resultMark} aria-hidden>{state.phase === "won" ? "✓" : "↻"}</span>
        <strong>{state.phase === "won" ? "ครบทุกคู่แล้ว!" : "เกือบได้แล้ว"}</strong>
        <span>{state.phase === "won" ? "ไปต่อกันเลย" : `จับคู่ได้ ${pairs} จาก 4 คู่`}</span>
      </div>}
      </div>

      <footer className={styles.footer}>
        <p className={styles.message} data-positive={state.open.length === 2 && !mismatch || undefined} role="status" aria-live="polite">{message}</p>
        {state.phase === "ready" ? (
          <button className={styles.start} type="button" onClick={() => { play("click"); dispatch({ type: "start", deck: shuffle(INITIAL.deck) }); }}>
            เริ่มจับคู่
          </button>
        ) : (
          <div className={styles.bottomLine}>
            <span>{state.phase === "memorize" ? "ดูภาพก่อน 3 วินาที" : `เปิดไปแล้ว ${state.moves} ครั้ง`}</span>
            <span>{state.phase === "memorize" ? "ยังไม่เริ่มจับเวลา" : state.phase === "won" ? "เรียบร้อย ✓" : "เวลาเล่น 45 วินาที"}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

function MemorySymbol({ kind }: { kind: SymbolId }) {
  return (
    <Image
      src={`/assets/memory-stickers/${kind}.png`}
      alt=""
      width={96}
      height={96}
      sizes="(max-width: 520px) 46px, 68px"
      loading="eager"
      className={styles.symbol}
    />
  );
}
