"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export type BoxKind = "diamond" | "silver" | "wood";

const ART = {
  diamond: { closed: "/assets/box-diamond-closed-v2.png", open: "/assets/box-diamond-open-v2.png" },
  silver: { closed: "/assets/box-silver-closed.png", open: "/assets/box-silver-open.png" },
  wood: { closed: "/assets/box-wood-closed.png", open: "/assets/box-wood-open.png" },
} as const;

const SPARK_TINTS = ["#ffffff", "#bdf4ff", "#56c7ff", "#ffd978"];
const SILVER_TINTS = ["#ffffff", "#e6edf3", "#c3d2de", "#f2f6f9"];
const EMBER_TINTS = ["#ffb347", "#ff8a24", "#ffd978", "#e56a10"];

/** Per-tier lighting. Keeping it in one table stops the ground spot, the halo
 *  and the burst flash from drifting apart when a tier is added. */
const GLOW: Record<BoxKind, { spot: string; halo: string; flash: string; label: string }> = {
  diamond: {
    spot: "radial-gradient(ellipse at center, rgba(46,123,255,0.26) 0%, rgba(86,199,255,0.14) 52%, transparent 78%)",
    halo: "radial-gradient(circle, rgba(125,214,255,0.26) 0%, transparent 70%)",
    flash: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(86,203,255,0.5) 30%, rgba(255,191,64,0.16) 55%, transparent 75%)",
    label: "เปิดกล่องเพชร",
  },
  silver: {
    spot: "radial-gradient(ellipse at center, rgba(120,145,170,0.26) 0%, rgba(190,208,222,0.16) 52%, transparent 78%)",
    halo: "radial-gradient(circle, rgba(214,228,238,0.30) 0%, transparent 70%)",
    flash: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(214,228,238,0.55) 30%, rgba(150,175,196,0.18) 55%, transparent 75%)",
    label: "เปิดกล่องเงิน",
  },
  wood: {
    spot: "radial-gradient(ellipse at center, rgba(229,106,16,0.28) 0%, rgba(255,179,71,0.15) 52%, transparent 78%)",
    halo: "radial-gradient(circle, rgba(255,160,60,0.24) 0%, transparent 70%)",
    flash: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,201,92,0.55) 30%, rgba(255,150,40,0.18) 55%, transparent 75%)",
    label: "เปิดกล่องไม้",
  },
};

type Props = {
  kind: BoxKind;
  compact: boolean;
  onOpened: () => void;
  reduced: boolean;
};

/**
 * The open runs as one GSAP timeline rather than a chain of setTimeouts. Same
 * beats, but the timeline is a single object that can be killed on unmount, so
 * a user who navigates mid-open cannot leave callbacks firing into a component
 * that no longer exists.
 *
 * Layering is deliberate. Idle float, press squash and charge all drive
 * transform; on one element they would overwrite each other, so each gets its
 * own. Float and breathe do share an element, but only because breathe writes
 * the separate `scale` property.
 */
export function LootBox({ kind, compact, onOpened, reduced }: Props) {
  const root = useRef<HTMLButtonElement>(null);
  const squish = useRef<HTMLSpanElement>(null);
  const burst = useRef<HTMLSpanElement>(null);
  const flash = useRef<HTMLSpanElement>(null);
  const opened = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  const throwParticles = () => {
    const host = burst.current;
    if (!host) return;
    const add = (el: HTMLElement) => {
      host.append(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    };

    if (kind === "diamond" || kind === "silver") {
      // Crystal chips for diamond, cooler and fewer for silver. The brief rules
      // out confetti explicitly, and eight is the top of its stated range
      // rather than beyond it.
      const tints = kind === "diamond" ? SPARK_TINTS : SILVER_TINTS;
      const count = kind === "diamond" ? 8 : 6;
      for (let n = 0; n < count; n++) {
        const s = document.createElement("i");
        s.className = "spark";
        const a = Math.PI * (0.15 + Math.random() * 0.7);
        const d = 40 + Math.random() * 70;
        s.style.setProperty("--dx", `${Math.cos(a) * d * (n % 2 ? 1 : -1)}px`);
        s.style.setProperty("--dy", `${-Math.sin(a) * d}px`);
        s.style.setProperty("--sz", `${6 + Math.random() * 7}px`);
        s.style.setProperty("--tint", tints[n % tints.length]);
        add(s);
      }
      return;
    }

    for (let n = 0; n < 6; n++) {
      const e = document.createElement("i");
      e.className = "ember";
      e.style.setProperty("--dx", `${Math.random() * 54 - 27}px`);
      e.style.setProperty("--dy", `${-(46 + Math.random() * 46)}px`);
      e.style.setProperty("--sz", `${4 + Math.random() * 5}px`);
      e.style.setProperty("--tint", EMBER_TINTS[n % EMBER_TINTS.length]);
      e.style.animationDelay = `${n * 45}ms`;
      add(e);
    }
    for (let n = 0; n < 2; n++) {
      const k = document.createElement("i");
      k.className = "smoke";
      k.style.setProperty("--dx", `${n ? 26 : -24}px`);
      k.style.setProperty("--dy", `${-38 - Math.random() * 20}px`);
      k.style.animationDelay = `${n * 90}ms`;
      add(k);
    }
  };

  const buzz = (ms: number) => {
    // Android Chrome honours this; iOS Safari does not expose it at all, so
    // the guard is the whole story.
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
  };

  const { contextSafe } = useGSAP({ scope: root });

  const handleOpen = contextSafe(() => {
    if (opened.current) return;
    opened.current = true;

    if (reduced) {
      setIsOpen(true);
      onOpened();
      return;
    }

    buzz(12);
    const el = squish.current;

    gsap
      .timeline()
      // 0–130 · press, squashing wider as it goes down so it reads as soft
      .to(el, { scaleX: 1.04, scaleY: 0.92, y: 5, duration: 0.13, ease: "power2.out" })
      // 130–420 · charge, light gathering inside
      .to(el, { scaleX: 1, scaleY: 1, y: 0, scale: 0.98, rotate: -0.8, duration: 0.06 })
      .to(el, { scale: 1.06, rotate: 0.6, duration: 0.12 })
      .to(el, { scale: 1.0, rotate: 0.2, duration: 0.06 })
      .to(el, { scale: 1.04, rotate: 0, duration: 0.05 })
      // 420–570 · one short jolt. 3px is the ceiling — more and it stops
      // reading as premium and starts reading as arcade.
      .to(el, { x: -3, duration: 0.037 })
      .to(el, { x: 3, duration: 0.037 })
      .to(el, { x: -2, duration: 0.037 })
      .to(el, { x: 0, duration: 0.039 })
      // 570 · lid crossfades while the body absorbs it letting go. This squash
      // carries the weight a rotating lid would have, since the art is two
      // still frames with no underside to swing.
      .call(() => setIsOpen(true))
      .to(el, { scaleY: 0.95, duration: 0.13 })
      .to(el, { scaleY: 1.03, duration: 0.15 })
      .to(el, { scaleY: 1, duration: 0.14 }, "<0.1")
      // 620 · burst
      .call(() => {
        flash.current?.classList.add("is-flashing");
        throwParticles();
        buzz(25);
      }, undefined, 0.62)
      // 900 · the reward rises
      .call(onOpened, undefined, 0.9)
      // 1250 · settle
      .to(el, { rotate: 0.6, duration: 0.12 }, 1.25)
      .to(el, { rotate: -0.3, duration: 0.2 })
      .to(el, { rotate: 0, duration: 0.18 });
  });

  const art = ART[kind];
  const glow = GLOW[kind];
  const spot = isOpen
    ? glow.spot
    : "radial-gradient(ellipse at center, rgba(10,26,47,0.14) 0%, rgba(10,26,47,0.06) 55%, transparent 78%)";

  return (
    <button
      ref={root}
      type="button"
      onClick={handleOpen}
      aria-describedby="boxHint"
      className={[
        "group relative mx-auto mt-2.5 mb-1 block cursor-pointer border-0 bg-transparent p-0",
        "transition-[transform,width,height] duration-[520ms] ease-[var(--ease-out-soft)]",
        compact
          ? "w-[198px] h-[196px] max-md:w-[146px] max-md:h-[144px] cursor-default"
          : "w-[360px] h-[356px] max-md:w-[260px] max-md:h-[257px] hover:-translate-y-2.5 hover:scale-[1.03] focus-visible:-translate-y-2.5 focus-visible:scale-[1.03]",
      ].join(" ")}
    >
      {/* Ground plane. It doubles as the contact shadow, which is why the
          painted one was keyed out of the source art — a baked shadow cannot
          widen on hover or warm up when the lid opens. */}
      <span
        aria-hidden
        className={[
          "absolute bottom-[2%] left-1/2 -translate-x-1/2 rounded-[50%] blur-[16px]",
          "transition-[width,height,opacity,background] duration-[280ms] ease-out",
          compact ? "w-[176px] h-[42px]" : "w-[300px] h-[68px] group-hover:w-[340px] group-hover:h-[74px] group-hover:opacity-70",
        ].join(" ")}
        style={{ background: spot }}
      />
      <span
        aria-hidden
        className={[
          "absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[30px] transition-[background] duration-500",
          compact ? "w-[200px] h-[200px]" : "w-[340px] h-[340px]",
        ].join(" ")}
        style={{
          background: isOpen ? glow.halo : "radial-gradient(circle, rgba(255,183,122,0.18) 0%, transparent 70%)",
        }}
      />

      <span aria-hidden className={`absolute inset-0 block ${isOpen ? "" : "anim-float"}`}>
        <span ref={squish} className="absolute inset-0 block">
          {(["closed", "open"] as const).map((frame) => (
            <img
              key={frame}
              src={art[frame]}
              width={480}
              height={474}
              alt=""
              className="absolute inset-0 h-full w-full object-contain transition-[opacity,filter] duration-[280ms]"
              style={{
                opacity: (frame === "open") === isOpen ? 1 : 0,
                filter:
                  kind === "diamond"
                    ? "drop-shadow(0 14px 18px rgba(10,26,47,0.16))"
                    : "drop-shadow(0 14px 18px rgba(10,26,47,0.2))",
              }}
            />
          ))}

          {/* Sweep and charge glow are masked to the chest silhouette so
              neither reads as a rectangle sliding over the art. */}
          <span
            className={`absolute inset-0 ${isOpen ? "opacity-0" : "anim-shine"}`}
            style={{
              background:
                "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.55) 48%, transparent 61%)",
              backgroundSize: "260% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "-130% 0",
              WebkitMaskImage: `url(${art.closed})`,
              maskImage: `url(${art.closed})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />

          <span ref={flash} className="pointer-events-none absolute left-1/2 top-[46%] block -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
            style={{ width: 330, height: 330, background: glow.flash }}
          />
        </span>
      </span>

      <span aria-hidden className="pointer-events-none absolute -inset-3.5">
        {[
          "top-[12%] left-[6%] w-2.5 h-2.5",
          "top-[30%] right-[4%] w-[13px] h-[13px]",
          "bottom-[22%] left-[2%] w-2 h-2",
          "top-[4%] right-[26%] w-[9px] h-[9px]",
        ].map((pos, i) => (
          <i
            key={i}
            className={`absolute opacity-0 ${pos} ${isOpen ? "" : "anim-sparkle"}`}
            style={{
              animationDelay: `${[0, 1.3, 2.1, 3.4][i]}s`,
              background:
                "linear-gradient(to bottom, transparent 46%, #fff 46% 54%, transparent 54%), linear-gradient(to right, transparent 46%, #fff 46% 54%, transparent 54%)",
              filter: "drop-shadow(0 0 4px rgba(140,220,255,0.9))",
            }}
          />
        ))}
      </span>

      <span ref={burst} aria-hidden className="pointer-events-none absolute inset-0" />
      <span className="sr-only">{glow.label}</span>
    </button>
  );
}
