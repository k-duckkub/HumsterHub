"use client";

import { useEffect, useState } from "react";
import { AFTERMATH, SHOWER_LABEL, USE_SPRITE } from "@/lib/hamsterFrames";
import { HamsterSprite } from "./HamsterSprite";

/**
 * The fail meter, drawn rather than sprited.
 *
 * It follows the painted reference sheet beat for beat — eight of them, not
 * six: after the fifth miss the water stops, she drips, then she folds her
 * arms and shivers. Those last two are an aftermath on a timer, not two more
 * ways to fail, which is why `beat` is separate from `level`.
 *
 * Drawn rather than framed because the shower is additive — pipe, then head,
 * then drops, then flow. Stills would have to redraw the whole hamster six
 * times and still could not slide the pipe in or pop the head on.
 */

type Props = {
  /** 0–5, one per miss. Anything higher is clamped to the fully soaked state. */
  level: number;
  /** Shrinks the scene to a strip so a running game keeps its vertical space. */
  compact?: boolean;
  reduced?: boolean;
};

const GINGER = "#F0641E";
const GINGER_DARK = "#D24E10";
const SKIN = "#F8DFB6";
const SKIN_LIGHT = "#FCEDD2";
const EAR_PINK = "#F09A99";
const SHIRT = "#1B1B1F";
const PINK = "#EE2F73";
const PINK_LIGHT = "#FF6BA4";
const INK = "#3A2415";
const METAL = "#A9BCCF";
const METAL_DARK = "#8098B2";
const WATER = "#7EC8F0";

/** Nudges away from the water as it gets closer, then gives up at level 5. */
const SHIFT_X = [0, 0, -3, -9, -6, 0];

type Pose = "idle" | "guard" | "flail" | "hang" | "hug";

export function HamsterShower({ level, compact = false, reduced = false }: Props) {
  const lv = Math.max(0, Math.min(5, Math.round(level)));

  // 0 = whatever the level says · 1 = water off, still dripping · 2 = shivering
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (lv < 5) {
      setBeat(0);
      return;
    }
    const timers = AFTERMATH.map((step) =>
      window.setTimeout(
        () => setBeat(step.frame - 5),
        reduced ? step.at / 6 : step.at,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [lv, reduced]);

  // The painted sheet is the intended artwork. Once it is in public/assets the
  // flag flips and none of the drawing below runs.
  if (USE_SPRITE) return <HamsterSprite level={level} compact={compact} reduced={reduced} />;

  const raining = lv >= 4 && beat === 0;
  const dripping = lv === 3 || (lv >= 5 && beat >= 1);
  const shivering = lv >= 5 && beat >= 2;

  const pose: Pose =
    shivering ? "hug"
      : lv >= 5 ? "hang"
        : lv === 4 ? "flail"
          : lv >= 1 ? "guard"
            : "idle";

  return (
    <div
      role="img"
      aria-label={SHOWER_LABEL[lv]}
      className={[
        "mx-auto w-full transition-[height] duration-500 ease-[var(--ease-out-soft)]",
        compact ? "h-[116px] max-md:h-[84px]" : "h-[212px] max-md:h-[168px]",
      ].join(" ")}
    >
      <svg viewBox="0 0 240 220" className="h-full w-full" aria-hidden focusable="false">
        <defs>
          <radialGradient id="hh-glow" cx="50%" cy="40%" r="56%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hh-pipe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={METAL_DARK} />
            <stop offset="45%" stopColor="#DCE7F0" />
            <stop offset="100%" stopColor={METAL} />
          </linearGradient>
          {/* Sits over the fur from level 4 and is what makes "wet" read
              without a second set of artwork. */}
          <linearGradient id="hh-wet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E86C4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2E86C4" stopOpacity="0.03" />
          </linearGradient>
          <clipPath id="hh-silhouette">
            <ellipse cx="120" cy="118" rx="48" ry="43" />
            <circle cx="92" cy="137" r="21" />
            <circle cx="148" cy="137" r="21" />
            <ellipse cx="120" cy="176" rx="41" ry="31" />
          </clipPath>
        </defs>

        <ellipse cx="120" cy="56" rx="98" ry="56" fill="url(#hh-glow)" />

        {/* ── Plumbing. Slides in at level 1, gains its head at level 2. ── */}
        <g
          style={{
            transform: lv >= 1 ? "translateY(0)" : "translateY(-52px)",
            opacity: lv >= 1 ? 1 : 0,
            transition: "transform 400ms var(--ease-out-soft), opacity 400ms linear",
          }}
        >
          <rect x="112" y="-8" width="16" height="26" rx="5" fill="url(#hh-pipe)" />
          <rect x="106" y="9" width="28" height="9" rx="4" fill={METAL_DARK} />
        </g>

        {lv >= 2 && (
          <g
            key="showerhead"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center top",
              animation: "hh-head-pop 460ms var(--ease-spring) both",
            }}
          >
            <path d="M104 17h32l14 13a3.6 3.6 0 0 1-2.5 6.2H92.5A3.6 3.6 0 0 1 90 30z" fill="url(#hh-pipe)" />
            <rect x="86" y="30" width="68" height="7" rx="3.5" fill={METAL_DARK} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle key={i} cx={94 + i * 8.7} cy="35.6" r="1.6" fill="#5D7A96" />
            ))}
          </g>
        )}

        {dripping && (
          <g key="drops">
            {[
              { x: 104, delay: 0, fall: 40 },
              { x: 121, delay: 0.5, fall: 48 },
              { x: 138, delay: 1, fall: 38 },
            ].map((d) => (
              <path
                key={d.x}
                d={`M${d.x} 39c2.6 3.4 4 5.6 4 7.4a4 4 0 0 1-8 0c0-1.8 1.4-4 4-7.4z`}
                fill={WATER}
                style={{
                  ["--fall" as string]: `${d.fall}px`,
                  animation: `hh-drop 1.5s ${d.delay}s ease-in infinite`,
                }}
              />
            ))}
          </g>
        )}

        <g
          style={{
            transform: `translateX(${SHIFT_X[lv]}px)`,
            transition: "transform 420ms var(--ease-out-soft)",
          }}
        >
          {/* Keyed so the one-shot hop replays when the level lands on 4 rather
              than being stuck in its finished state. */}
          <g key={`hop-${lv}`} style={lv === 4 ? { animation: "hh-hop 520ms var(--ease-out-soft) both" } : undefined}>
            <Hamster level={lv} pose={pose} wet={lv >= 4} shivering={shivering} />
          </g>
        </g>

        {/* Water runs in front of the hamster, not behind it. Behind, the head
            hides the whole flow and the scene reads as a dry shower head. */}
        {raining && (
          <g key="stream" opacity="0.62">
            {[88, 98, 108, 120, 132, 142, 152].map((x, i) => (
              <rect
                key={x}
                x={x}
                y="38"
                width="3.4"
                height="26"
                rx="1.7"
                fill={WATER}
                style={{
                  ["--fall" as string]: `${106 + (i % 3) * 14}px`,
                  animation: `hh-stream ${0.72 + (i % 3) * 0.09}s ${i * 0.07}s linear infinite`,
                }}
              />
            ))}
          </g>
        )}

        {/* Nervous sweat while the threat is only looming — pointless once the
            water is actually on. */}
        {lv >= 1 && lv <= 3 && (
          <path
            d="M166 96c2.4 3.2 3.7 5.2 3.7 6.9a3.7 3.7 0 0 1-7.4 0c0-1.7 1.3-3.7 3.7-6.9z"
            fill={WATER}
            style={{ animation: "hh-sweat 2.2s ease-in infinite" }}
          />
        )}

        {lv >= 5 && (
          <g>
            {[[84, 202], [156, 204], [120, 208]].map(([x, y], i) => (
              <ellipse
                key={x}
                cx={x}
                cy={y}
                rx="13"
                ry="4"
                fill="none"
                stroke={WATER}
                strokeWidth="2.4"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: `hh-splash 1.4s ${i * 0.35}s ease-out infinite`,
                }}
              />
            ))}
          </g>
        )}

        {shivering && <ShiverMarks />}
      </svg>
    </div>
  );
}

function Hamster({
  level,
  pose,
  wet,
  shivering,
}: {
  level: number;
  pose: Pose;
  wet: boolean;
  shivering: boolean;
}) {
  const earFlat = level >= 3 ? (level >= 5 ? 40 : 24) : 0;

  return (
    <g
      style={
        shivering
          ? {
              transformBox: "fill-box",
              transformOrigin: "50% 90%",
              animation: "hh-shiver 2.6s ease-in-out infinite",
            }
          : undefined
      }
    >
      <ellipse cx="120" cy="206" rx="62" ry="9" fill="rgba(10,26,47,0.10)" />

      {/* Ears sit behind the head, so flattening them only rotates a disc
          instead of needing a second silhouette. */}
      {[
        { cx: 80, cy: 92, pivot: "94px 104px", dir: -1 },
        { cx: 160, cy: 92, pivot: "146px 104px", dir: 1 },
      ].map((ear) => (
        <g
          key={ear.cx}
          style={{
            transform: `rotate(${ear.dir * earFlat}deg)`,
            transformOrigin: ear.pivot,
            transition: "transform 420ms var(--ease-out-soft)",
          }}
        >
          <circle cx={ear.cx} cy={ear.cy} r="19" fill={GINGER} />
          <circle cx={ear.cx} cy={ear.cy + 1} r="11" fill={EAR_PINK} />
        </g>
      ))}

      <Bow />

      {/* Body first, head over the top — the mascot's head is wider than its
          shoulders, so the overlap has to run that way. */}
      <ellipse cx="120" cy="176" rx="41" ry="31" fill={SHIRT} />
      <path d="M113 168l16 9-16 9z" fill={PINK} />
      {/* Feet after the shirt, or the tee's ellipse swallows them. */}
      <ellipse cx="101" cy="204" rx="15" ry="8.5" fill={SKIN} />
      <ellipse cx="139" cy="204" rx="15" ry="8.5" fill={SKIN} />

      {/* Ginger is the outer silhouette and cream is inset into it — the other
          way round (a cream head wearing a ginger cap) reads as a wig. */}
      <ellipse cx="120" cy="118" rx="48" ry="43" fill={GINGER} />
      <path d="M96 84c7-8 18-10 26-5" stroke={GINGER_DARK} strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Four overlapping shapes union into one wide face: a forehead the eyes
          sit on, a muzzle, and two cheeks that bulge past the ginger edge. */}
      <g fill={SKIN_LIGHT}>
        <ellipse cx="120" cy="120" rx="27" ry="22" />
        <ellipse cx="120" cy="136" rx="38" ry="24" />
        <circle cx="92" cy="137" r="21" />
        <circle cx="148" cy="137" r="21" />
      </g>

      <Eyes level={level} />
      <path d="M114 131h12l-6 7z" fill={PINK} />
      <Mouth level={level} />

      {/* Wet pass: a cool wash clipped to the silhouette plus beads on the fur.
          Cheaper and steadier than a filter, which would soften the outline at
          the compact size. */}
      <g clipPath="url(#hh-silhouette)" style={{ opacity: wet ? 1 : 0, transition: "opacity 420ms linear" }}>
        <rect x="66" y="74" width="108" height="140" fill="url(#hh-wet)" />
        {[[95, 152], [143, 150], [110, 190], [154, 186], [88, 186]].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.4" ry="4.4" fill="#CFEBF9" opacity="0.9" />
        ))}
      </g>

      {/* Soaked fur hangs in strands past the fur line. Without it a wet
          hamster and a dry one differ only by a colour wash. */}
      {wet && <WetFringe />}

      {/* Arms last so a raised paw sits over the cheek rather than under it. */}
      <Arms pose={pose} />
    </g>
  );
}

function Arms({ pose }: { pose: Pose }) {
  const paw = { fill: SKIN };

  if (pose === "guard") {
    // Both paws up at the mouth — the sheet's "oh no" pose.
    return (
      <g {...paw}>
        <circle cx="103" cy="154" r="11" />
        <circle cx="137" cy="154" r="11" />
        <ellipse cx="86" cy="182" rx="11" ry="9" />
        <ellipse cx="154" cy="182" rx="11" ry="9" />
      </g>
    );
  }

  if (pose === "flail") {
    return (
      <g {...paw}>
        <ellipse cx="76" cy="152" rx="11" ry="15" transform="rotate(-30 76 152)" />
        <ellipse cx="164" cy="152" rx="11" ry="15" transform="rotate(30 164 152)" />
      </g>
    );
  }

  if (pose === "hug") {
    // Arms folded across the chest, the shiver pose.
    return (
      <g {...paw}>
        <rect x="88" y="170" width="64" height="14" rx="7" transform="rotate(-11 120 177)" />
        <rect x="88" y="176" width="64" height="14" rx="7" transform="rotate(11 120 183)" />
      </g>
    );
  }

  if (pose === "idle") {
    // One paw raised to the chin, the way the mascot is posed. Any higher and
    // it sits on the cheek and reads as a lump on her face.
    return (
      <g {...paw}>
        <circle cx="134" cy="160" r="9.5" />
        <ellipse cx="84" cy="180" rx="12" ry="10" />
      </g>
    );
  }

  return (
    <g {...paw}>
      <ellipse cx="84" cy="182" rx="12" ry="10" />
      <ellipse cx="156" cy="182" rx="12" ry="10" />
    </g>
  );
}

function WetFringe() {
  return (
    <g stroke={GINGER_DARK} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.92">
      <path d="M82 100q-3 12-1 22" />
      <path d="M95 92q-3 14-2 26" />
      <path d="M158 100q3 12 1 22" />
      <path d="M145 92q3 14 2 26" />
    </g>
  );
}

function ShiverMarks() {
  return (
    <g stroke={WATER} strokeWidth="2.6" strokeLinecap="round" fill="none">
      {[
        { d: "M62 150q5 6 0 12t0 12", delay: 0 },
        { d: "M54 162q5 6 0 12", delay: 0.3 },
        { d: "M178 150q-5 6 0 12t0 12", delay: 0.15 },
        { d: "M186 162q-5 6 0 12", delay: 0.45 },
      ].map((m) => (
        <path key={m.d} d={m.d} style={{ animation: `hint-pulse 1.1s ${m.delay}s ease-in-out infinite` }} />
      ))}
    </g>
  );
}

function Bow() {
  return (
    <g>
      <ellipse cx="100" cy="66" rx="16" ry="13" fill={PINK} transform="rotate(-16 100 66)" />
      <ellipse cx="140" cy="66" rx="16" ry="13" fill={PINK} transform="rotate(16 140 66)" />
      <ellipse cx="100" cy="63" rx="8" ry="5" fill={PINK_LIGHT} transform="rotate(-16 100 63)" opacity="0.75" />
      <ellipse cx="140" cy="63" rx="8" ry="5" fill={PINK_LIGHT} transform="rotate(16 140 63)" opacity="0.75" />
      <circle cx="120" cy="68" r="8" fill={PINK} />
      <circle cx="118" cy="65.5" r="3" fill={PINK_LIGHT} opacity="0.8" />
    </g>
  );
}

function Eyes({ level }: { level: number }) {
  // Soaked: half-lidded and sad. The sheet holds this for the last three
  // frames, and it is what separates "given up" from "still panicking".
  if (level >= 5) {
    return (
      <g>
        {[104, 136].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="118" rx="10" ry="11" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
            <ellipse cx={cx} cy="121" rx="5.6" ry="6.2" fill={INK} />
            <path
              d={`M${cx - 11} 116a11 11 0 0 1 22 0z`}
              fill={SKIN_LIGHT}
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>
        ))}
        <g stroke={INK} strokeWidth="3.6" strokeLinecap="round" fill="none">
          <path d="M92 101q9 4 15 1" />
          <path d="M148 101q-9 4-15 1" />
        </g>
      </g>
    );
  }

  // Water landing: eyes screwed shut, brows up. Open eyes here read as
  // staring, not flinching.
  if (level === 4) {
    return (
      <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M96 120q9-10 18 0" />
        <path d="M126 120q9-10 18 0" />
        <path d="M92 100q8-6 16-3" strokeWidth="3.4" opacity="0.85" />
        <path d="M148 100q-8-6-16-3" strokeWidth="3.4" opacity="0.85" />
      </g>
    );
  }

  // Pupils ride up toward the pipe from level 1 — the cheapest possible read
  // on "it noticed".
  const pupilY = level >= 1 ? 111 : 116;
  return (
    <g>
      {[104, 136].map((cx) => (
        <g
          key={cx}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: "hh-blink 5.5s ease-in-out infinite",
          }}
        >
          <ellipse cx={cx} cy="116" rx="10" ry="12" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
          <ellipse
            cx={cx}
            cy={pupilY}
            rx="5.4"
            ry="6.6"
            fill={INK}
            style={{ transition: "cy 380ms var(--ease-out-soft)" }}
          />
          <circle cx={cx - 1.8} cy={pupilY - 2.6} r="2.1" fill="#fff" />
        </g>
      ))}
      <g stroke={INK} strokeWidth="3.6" strokeLinecap="round" fill="none">
        {level >= 2 ? (
          <>
            <path d="M92 99l14 4" />
            <path d="M148 99l-14 4" />
          </>
        ) : (
          <>
            <path d="M95 100q9-5 17-2" />
            <path d="M145 100q-9-5-17-2" />
          </>
        )}
      </g>
    </g>
  );
}

function Mouth({ level }: { level: number }) {
  // Soaked: a cute grumpy wave, not a grimace — the tone stays funny.
  if (level >= 5) {
    return <path d="M110 146q5 6 10 0t10 0" stroke={INK} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
  }
  // Water landing: wide open, mid-yelp.
  if (level === 4) {
    return (
      <g>
        <ellipse cx="120" cy="148" rx="9" ry="11" fill={INK} />
        <ellipse cx="120" cy="153" rx="5" ry="4.5" fill={PINK} opacity="0.8" />
      </g>
    );
  }
  if (level >= 2) return <ellipse cx="120" cy="147" rx="6.5" ry="8" fill={INK} />;
  if (level === 1) return <ellipse cx="120" cy="146" rx="4.5" ry="5.5" fill={INK} />;
  // Open smile with one tooth, the way the mascot is drawn.
  return (
    <g>
      <path d="M110 142q10 13 20 0z" fill={INK} />
      <rect x="116" y="142" width="8" height="4" rx="1.4" fill="#FFFFFF" />
    </g>
  );
}
