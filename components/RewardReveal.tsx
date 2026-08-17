"use client";

import { useEffect, useState } from "react";
import { RARITY_COLOR, REVEAL_MS, type RollResult } from "@/lib/rewards";

type Props = { reward: RollResult; reduced: boolean };

/** How many particles gather in, by rarity. The brief caps this deliberately. */
const PARTICLES = { COMMON: 3, CURRENCY: 4, RARE: 6, EPIC: 9 } as const;

/**
 * What the run actually dropped.
 *
 * Two phases: a held beat with the prize hidden, then the reveal. The hold is
 * what makes a rare drop feel rare — the artwork is the same size and lands in
 * the same place every time, so anticipation is the only lever that separates
 * an epic from a common without turning it into a different screen.
 */
export function RewardReveal({ reward, reduced }: Props) {
  const [revealed, setRevealed] = useState(false);

  const tint = RARITY_COLOR[reward.rarity];
  const beats = REVEAL_MS[reward.rarity];
  const isEpic = reward.rarity === "EPIC";

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), reduced ? 0 : beats.anticipate);
    return () => window.clearTimeout(id);
  }, [beats.anticipate, reduced]);

  // Nothing was won, so there is nothing to build up to.
  if (reward.category === "NONE") {
    return (
      <section className="mb-5 rounded-[30px] border border-[rgba(10,26,47,0.06)] bg-white px-[22px] py-7 text-center shadow-[0_24px_60px_rgba(10,26,47,0.10)] max-md:rounded-[var(--radius-md)] max-md:px-4 max-md:py-6">
        <p className="text-[19px] font-extrabold text-ink max-md:text-[17px]">{reward.name}</p>
        <p className="mt-1.5 text-[15px] text-slate-body">ไว้ลองใหม่รอบหน้านะ</p>
      </section>
    );
  }

  return (
    <section
      role="status"
      aria-live="polite"
      className="relative mb-5 overflow-hidden rounded-[30px] border border-[rgba(10,26,47,0.06)] bg-white px-[22px] py-7 text-center shadow-[0_24px_60px_rgba(10,26,47,0.10)] max-md:rounded-[var(--radius-md)] max-md:px-4 max-md:py-6"
    >
      {/* Epic dims its own card rather than the page. A full-screen flash was
          ruled out, and dimming the surface the prize sits on does the same
          job of making everything else recede. */}
      {isEpic && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ background: "radial-gradient(circle at 50% 42%, rgba(155,93,229,0.14), rgba(10,26,47,0.10))", opacity: revealed ? 1 : 0 }}
        />
      )}

      <p
        className="relative mb-4 inline-block rounded-full px-3.5 py-1 text-[13px] font-extrabold uppercase tracking-[0.18em] text-white"
        style={{ background: tint }}
      >
        {reward.rarity}
      </p>

      <div className="relative mx-auto grid h-[168px] w-[168px] place-items-center max-md:h-[136px] max-md:w-[136px]">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-[26px]"
          style={{
            background: `radial-gradient(circle, ${tint}59 0%, transparent 70%)`,
            animation: revealed && !reduced ? `hh-aura ${beats.reveal}ms var(--ease-out-soft) both` : undefined,
            opacity: revealed ? 1 : 0,
          }}
        />

        {!revealed ? (
          <span
            className="grid h-[120px] w-[120px] place-items-center rounded-[26px] text-[38px] font-extrabold text-white max-md:h-[100px] max-md:w-[100px]"
            style={{
              background: `${tint}2e`,
              color: tint,
              animation: reduced ? undefined : `hh-tiny-shake 260ms ease-in-out ${reward.rarity === "COMMON" ? 0 : 1}`,
            }}
          >
            ???
          </span>
        ) : (
          <>
            {!reduced && (
              <span aria-hidden className="pointer-events-none absolute inset-0">
                {Array.from({ length: PARTICLES[reward.rarity] }, (_, i) => {
                  const angle = (i / PARTICLES[reward.rarity]) * Math.PI * 2;
                  return (
                    <i
                      key={i}
                      className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full"
                      style={{
                        background: isEpic && i % 3 === 0 ? "#7BE38B" : tint,
                        ["--fx" as string]: `${Math.cos(angle) * 74}px`,
                        ["--fy" as string]: `${Math.sin(angle) * 74}px`,
                        animation: `hh-particle-in ${beats.reveal}ms var(--ease-out-soft) ${i * 35}ms both`,
                      }}
                    />
                  );
                })}
              </span>
            )}

            <Artwork reward={reward} reduced={reduced} duration={beats.reveal} tint={tint} />

            {reward.amount !== undefined && (
              <span
                className="absolute -top-1 right-1 rounded-full bg-ink px-3 py-1 text-[17px] font-extrabold text-white"
                style={{ animation: reduced ? undefined : "hh-amount-rise 620ms var(--ease-spring) 260ms both" }}
              >
                +{reward.amount}
              </span>
            )}
          </>
        )}
      </div>

      <p className="relative mt-4 text-[22px] font-extrabold tracking-[-0.01em] text-ink max-md:text-[19px]">
        {reward.name}
      </p>
      {reward.category === "PET" && revealed && (
        <p className="relative mt-1 text-[15px] font-extrabold uppercase tracking-[0.16em] text-orange">
          New Pet!
        </p>
      )}
      {reward.category === "EGG" && (
        <p className="relative mt-1 text-[15px] text-slate-body">เก็บไว้ฟักในระบบ Pet ทีหลังได้</p>
      )}
      {reward.amount !== undefined && (
        <p className="relative mt-1 text-[15px] text-slate-body">ได้ {reward.amount} Hamster Coin</p>
      )}
    </section>
  );
}

/** The prize itself. Each type lands differently; the artwork is untouched. */
function Artwork({
  reward,
  reduced,
  duration,
  tint,
}: {
  reward: RollResult;
  reduced: boolean;
  duration: number;
  tint: string;
}) {
  const entrance =
    reward.category === "PET" ? "hh-pet-bounce"
      : reward.category === "BOX" ? "hh-box-drop"
        : reward.category === "HAMSTERCOIN" ? "hh-coin-spin"
          : "hh-reveal-pop";

  const style = reduced
    ? undefined
    : {
        animation: `${entrance} ${duration}ms var(--ease-spring) both`
          // Eggs keep a slow wobble after they land, so they read as something
          // still alive rather than an icon.
          + (reward.category === "EGG" ? `, hh-egg-idle 2.6s ease-in-out ${duration}ms infinite` : ""),
      };

  if (!reward.imageUrl) {
    // No artwork committed yet. A named plate beats a broken image icon, and
    // the reveal choreography is identical either way.
    return (
      <span
        className="relative grid h-[120px] w-[120px] place-items-center rounded-[26px] px-2 text-center text-[15px] font-extrabold leading-tight max-md:h-[100px] max-md:w-[100px] max-md:text-[13px]"
        style={{ ...style, background: `${tint}24`, color: tint, border: `2px dashed ${tint}80` }}
      >
        {reward.name}
      </span>
    );
  }

  return (
    <img
      src={reward.imageUrl}
      alt=""
      width={256}
      height={256}
      className="relative h-[128px] w-[128px] object-contain drop-shadow-[0_10px_18px_rgba(10,26,47,0.2)] max-md:h-[106px] max-md:w-[106px]"
      style={style}
    />
  );
}
