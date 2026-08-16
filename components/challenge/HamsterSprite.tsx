"use client";

import { useEffect, useRef, useState } from "react";
import { AFTERMATH, cellPosition, FRAME_FOR_FAIL, SHEET, SHOWER_LABEL } from "@/lib/hamsterFrames";

type Props = {
  level: number;
  compact?: boolean;
  reduced?: boolean;
};

const FRAMES = Array.from({ length: SHEET.cols * SHEET.rows }, (_, i) => i);

/**
 * Renders the shower sheet rather than the drawn scene.
 *
 * Every frame is mounted at once and only opacity changes, so a change is a
 * crossfade instead of a cut. The poses differ enough between steps that a
 * hard swap reads as a glitch, and eight stacked divs sharing one background
 * image cost one decode either way.
 *
 * The sheet's own cream is kept — the frames are cream-on-cream and keying
 * them out eats into the belly. The panel behind them carries the same colour
 * so the crop is invisible.
 */
export function HamsterSprite({ level, compact = false, reduced = false }: Props) {
  const lv = Math.max(0, Math.min(5, Math.round(level)));
  const [frame, setFrame] = useState(FRAME_FOR_FAIL[lv]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => { list.forEach(window.clearTimeout); };
  }, []);

  useEffect(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setFrame(FRAME_FOR_FAIL[lv]);

    // Only the final state has an aftermath; every other level is a still.
    if (lv < 5) return;
    for (const step of AFTERMATH) {
      timers.current.push(
        window.setTimeout(() => setFrame(step.frame), reduced ? step.at / 6 : step.at),
      );
    }
  }, [lv, reduced]);

  return (
    <div
      role="img"
      aria-label={SHOWER_LABEL[lv]}
      className={[
        "mx-auto transition-[height] duration-500 ease-[var(--ease-out-soft)]",
        compact ? "h-[116px] max-md:h-[84px]" : "h-[212px] max-md:h-[168px]",
      ].join(" ")}
      style={{ aspectRatio: String(SHEET.cellAspect) }}
    >
      <div className="relative h-full w-full">
        {FRAMES.map((f) => (
          <span
            key={f}
            aria-hidden
            className="absolute inset-0 block bg-no-repeat transition-opacity duration-200"
            style={{
              backgroundImage: `url(${SHEET.src})`,
              backgroundSize: `${SHEET.cols * 100}% ${SHEET.rows * 100}%`,
              backgroundPosition: cellPosition(f),
              opacity: f === frame ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
