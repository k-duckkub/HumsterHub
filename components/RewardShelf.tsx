"use client";

import { motion } from "framer-motion";
import { rewardsFor } from "@/lib/rewards";
import type { Tier } from "@/lib/games";

type Props = { tier: Tier; reduced: boolean };

/**
 * What was in the box.
 *
 * Renders nothing at all until rewards are defined — an empty grid on a prize
 * screen looks broken, where no grid just looks like the box was the prize.
 *
 * Items pop in one after another rather than together: the box has only just
 * opened, and a stagger reads as things coming out of it.
 */
export function RewardShelf({ tier, reduced }: Props) {
  const rewards = rewardsFor(tier);
  if (rewards.length === 0) return null;

  return (
    <section className="mb-5 rounded-[30px] border border-[rgba(10,26,47,0.06)] bg-white px-[22px] py-6 shadow-[0_24px_60px_rgba(10,26,47,0.10)] max-md:rounded-[var(--radius-md)] max-md:px-4 max-md:py-5">
      <h3 className="mb-4 text-[22px] font-extrabold tracking-[-0.01em] max-md:text-[19px]">
        ของที่อยู่ในกล่อง
      </h3>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(104px,1fr))] gap-3.5 max-md:gap-2.5">
        {rewards.map((reward, i) => (
          <motion.li
            key={reward.id}
            initial={reduced ? false : { opacity: 0, y: 14, scale: 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reduced ? 0 : 0.42,
              delay: reduced ? 0 : i * 0.07,
              ease: [0.22, 1.4, 0.36, 1],
            }}
            className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] bg-warm-ivory px-2.5 py-3.5"
          >
            <img
              src={reward.image}
              alt=""
              width={192}
              height={192}
              className="h-[72px] w-[72px] object-contain drop-shadow-[0_6px_10px_rgba(10,26,47,0.14)] max-md:h-[60px] max-md:w-[60px]"
            />
            <span className="text-center text-[15px] font-bold leading-tight text-ink max-md:text-[13px]">
              {reward.name}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
