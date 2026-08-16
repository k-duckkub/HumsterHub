"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The fail meter, built from the painted mascot artwork.
 *
 * Five states, four images: 1 and 2 share the dry frame because the only thing
 * that changes between them is the shower head, which is cut out as its own
 * layer so it can slide in and then lock into place without the hamster moving
 * a pixel. The wet and soaked frames have their water painted in, so the loose
 * shower head hides once they take over.
 *
 * Every layer stays mounted and only opacity changes. That gives a crossfade
 * instead of a cut, and it means the browser has already decoded all four
 * frames before the first miss — a swap mid-run would otherwise flash.
 */

type Props = {
  /** Misses so far. Four and beyond are all "soaked". */
  failCount: number;
  /** Shrinks the scene to a strip so a running game keeps its vertical space. */
  compact?: boolean;
  reduced?: boolean;
};

const FRAMES = [
  "/assets/hamster-safe.webp",
  "/assets/hamster-worry.webp",
  "/assets/hamster-wet.webp",
  "/assets/hamster-soaked.webp",
] as const;

/** state → index into FRAMES. States 1 and 2 share the dry frame. */
const FRAME_OF = [0, 1, 1, 2, 3];

const LABEL = [
  "แฮมสเตอร์ยืนยิ้มมั่นใจ ยังไม่มีอะไรเกิดขึ้น",
  "ฝักบัวเลื่อนลงมาจากด้านบน แฮมสเตอร์เงยหน้ามองอย่างกังวล",
  "ฝักบัวเข้าที่แล้ว แฮมสเตอร์กุมมือแน่นด้วยความกลัว",
  "น้ำสาดลงมา แฮมสเตอร์หลับตาหนึ่งข้างและร้องออกมา",
  "แฮมสเตอร์เปียกทั้งตัว ขนแบน หน้าตางอนน้อยใจ",
];

/** Where the shake flings its droplets, as x offsets from the body centre. */
const SHAKE_DROPS = [-96, -58, -22, 24, 62, 98];

export function HamsterFailProgress({ failCount, compact = false, reduced = false }: Props) {
  const state = Math.max(0, Math.min(4, Math.round(failCount)));
  const [shaking, setShaking] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    setShaking(false);
    if (state < 4) return;
    // Let the soaked pose land and read before she shakes it off.
    timer.current = window.setTimeout(() => setShaking(true), reduced ? 120 : 500);
    return () => window.clearTimeout(timer.current);
  }, [state, reduced]);

  const showerLoose = state === 1 || state === 2;

  return (
    <div
      role="img"
      aria-label={LABEL[state]}
      className={[
        "relative mx-auto aspect-square transition-[height] duration-500 ease-[var(--ease-out-soft)]",
        compact ? "h-[124px] max-md:h-[92px]" : "h-[228px] max-md:h-[176px]",
      ].join(" ")}
    >
      {/* Outer: the slow idle bob, which never stops and owns translateY. */}
      <div
        className="absolute inset-0"
        style={reduced ? undefined : { animation: "hh-idle-float 4s ease-in-out infinite" }}
      >
        {/* Middle: the squash reaction, keyed so it replays on every change. */}
        <div
          key={`react-${state}`}
          className="absolute inset-0"
          style={reduced ? undefined : { animation: "hh-react 400ms var(--ease-out-soft) both" }}
        >
          {/* Inner: the one-off shake, which owns rotate. */}
          <div
            className="absolute inset-0"
            style={
              shaking && !reduced
                ? { animation: "hh-wet-shake 420ms var(--ease-out-soft) 1", transformOrigin: "50% 85%" }
                : undefined
            }
          >
            {/* Plain img, not next/image: these are five fixed-size layers that
                all need to be decoded before the first miss, and the optimizer
                would defer the ones that start at zero opacity. */}
            {FRAMES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                width={640}
                height={640}
                className="absolute inset-0 h-full w-full object-contain transition-opacity duration-[220ms]"
                style={{ opacity: FRAME_OF[state] === i ? 1 : 0 }}
              />
            ))}

            {/* The cut-out shower head, so states 1 and 2 differ by its arrival
                rather than by a second drawing of the whole scene. */}
            <img
              src="/assets/hamster-showerhead.webp"
              alt=""
              width={640}
              height={640}
              key={`shower-${state}`}
              className="absolute inset-0 h-full w-full object-contain"
              style={{
                opacity: showerLoose ? 1 : 0,
                transformOrigin: "50% 8%",
                animation: reduced || !showerLoose
                  ? undefined
                  : state === 1
                    ? "hh-shower-in 500ms var(--ease-out-soft) both"
                    : "hh-shower-lock 400ms var(--ease-spring) both",
              }}
            />

            {shaking && !reduced && (
              <span aria-hidden className="pointer-events-none absolute inset-0">
                {SHAKE_DROPS.map((dx, i) => (
                  <i
                    key={dx}
                    className="absolute left-1/2 top-[62%] block h-2.5 w-[7px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[#8FD6F5]"
                    style={{
                      ["--dx" as string]: `${dx}%`,
                      animation: `hh-drip ${520 + i * 40}ms ease-in ${i * 45}ms both`,
                      boxShadow: "0 0 4px rgba(143,214,245,0.6)",
                    }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
