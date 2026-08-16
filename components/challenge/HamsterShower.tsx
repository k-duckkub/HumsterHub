"use client";

/**
 * The fail meter, drawn rather than sprited.
 *
 * The brief describes six *additive* states — pipe, then head, then drops,
 * then flow — which is a layer stack, not a flipbook. Frames would have to
 * re-draw the hamster six times and could not slide the pipe in or pop the
 * head on; separate SVG layers get those entrances for free and stay crisp at
 * every size the scene is used at.
 *
 * The hamster is traced from the Hamster Hub mascot: ginger fur, pink bow,
 * cream cheeks, black tee with the pink play mark. Swap in the real artwork by
 * replacing <Hamster /> once the sprite lands in public/assets.
 */

type Props = {
  /** 0–5, one per miss. Anything higher is clamped to the fully soaked state. */
  level: number;
  /** Shrinks the scene to a strip so a running game keeps its vertical space. */
  compact?: boolean;
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

const LABEL = [
  "แฮมสเตอร์ยืนยิ้มมั่นใจ ยังไม่มีอะไรเกิดขึ้น",
  "มีท่อน้ำเลื่อนลงมาจากด้านบน แฮมสเตอร์เริ่มเหลียวมอง",
  "ฝักบัวโผล่มาแล้ว แฮมสเตอร์เริ่มกังวล",
  "น้ำเริ่มหยดลงมา แฮมสเตอร์ขยับหนี",
  "น้ำไหลลงมาแล้ว แฮมสเตอร์ตกใจ",
  "แฮมสเตอร์เปียกทั้งตัวและสั่นเล็กน้อย",
];

/** Nudges away from the water as it gets closer, then gives up at level 5. */
const SHIFT_X = [0, 0, -3, -9, -6, 0];

export function HamsterShower({ level, compact = false }: Props) {
  const lv = Math.max(0, Math.min(5, Math.round(level)));

  return (
    <div
      role="img"
      aria-label={LABEL[lv]}
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
          {/* Sits over the fur at level 4+ and is what makes "wet" read without
              a second set of artwork. */}
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

        {/* ── Water. Three drops at level 3, a full flow from level 4. ── */}
        {lv === 3 && (
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
            <Hamster level={lv} />
          </g>
        </g>

        {/* Water runs in front of the hamster, not behind it. Behind, the head
            hides the whole flow and the scene reads as a dry shower head. */}
        {lv >= 4 && (
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
      </svg>
    </div>
  );
}

function Hamster({ level }: { level: number }) {
  const wet = level >= 4;
  const soaked = level >= 5;
  const earFlat = level >= 3 ? (soaked ? 40 : 24) : 0;

  return (
    <g
      style={
        soaked
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

      {/* Legs and body first, head over the top — the mascot's head is wider
          than its shoulders, so the overlap has to run that way. */}
      <ellipse cx="120" cy="176" rx="41" ry="31" fill={SHIRT} />
      <path d="M113 168l16 9-16 9z" fill={PINK} />
      <ellipse cx="84" cy="180" rx="12" ry="10" fill={SKIN} />
      <ellipse cx="156" cy="180" rx="12" ry="10" fill={SKIN} />
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
  // Shut from level 4 — once the water lands, open eyes read as staring rather
  // than flinching.
  if (level >= 4) {
    return (
      <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M96 120q9-10 18 0" />
        <path d="M126 120q9-10 18 0" />
        <path d="M92 100q8-6 16-3" strokeWidth="3.4" opacity="0.85" />
        <path d="M148 100q-8-6-16-3" strokeWidth="3.4" opacity="0.85" />
      </g>
    );
  }

  // Pupils ride up toward the pipe from level 1 — the cheapest possible read on
  // "it noticed".
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
  // Cute grumpy wave at the end, not a grimace — the tone stays funny.
  if (level >= 4) {
    return <path d="M110 145q5 6 10 0t10 0" stroke={INK} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
  }
  if (level >= 2) return <ellipse cx="120" cy="147" rx="6" ry="7.5" fill={INK} />;
  // Open smile with one tooth, the way the mascot is drawn.
  return (
    <g>
      <path d="M110 142q10 13 20 0z" fill={INK} />
      <rect x="116" y="142" width="8" height="4" rx="1.4" fill="#FFFFFF" />
    </g>
  );
}
