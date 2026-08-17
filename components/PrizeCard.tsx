"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "./Icons";
import { RewardShelf } from "./RewardShelf";
import type { Tier } from "@/lib/games";

/** ═══════ ใส่ URL หน้า profile ตรงนี้ ═══════ */
const CHECKIN_URL = "#";

type Props = { onLater: () => void; reduced: boolean; tier: Tier };

export function PrizeCard({ onLater, reduced, tier }: Props) {
  return (
    <motion.div
      // The reward rising out of the chest: overshoots past its resting place,
      // then settles. The easing's y above 1 is what produces the overshoot.
      initial={reduced ? false : { opacity: 0, y: 40, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.56, ease: [0.22, 1.4, 0.36, 1], times: [0, 0.55, 1] }
      }
      className="w-full max-w-[min(90vw,680px)] text-center"
    >
      <p className="mb-3.5 text-[15px] font-extrabold uppercase tracking-[0.14em] text-orange">
        ยินดีด้วย! คุณผ่านชาเลนจ์แล้ว
      </p>

      {/* Rewards above the check-in: the check-in is the action, and an action
          reads last. Silent until lib/rewards.ts has entries. */}
      <RewardShelf tier={tier} reduced={reduced} />

      <div className="rounded-[30px] border border-[rgba(10,26,47,0.06)] bg-white px-[22px] py-8 shadow-[0_24px_60px_rgba(10,26,47,0.10)] max-md:rounded-[var(--radius-md)] max-md:px-4 max-md:py-6">
        <h3 className="text-[28px] font-extrabold tracking-[-0.01em] max-md:text-[23px]">เช็คอินเลยไหม?</h3>
        <p className="mx-auto mb-[18px] mt-3 inline-block whitespace-nowrap rounded-[var(--radius-sm)] bg-warm-ivory px-3.5 py-2.5 font-semibold leading-[1.5] text-ink [font-size:clamp(11.5px,3.1vw,15.5px)] max-[375px]:whitespace-normal max-[375px]:text-[13px]">
          เตือนถ้าเช็คอินทีหลังจะต้องไปเช็คอินใน Discord เองนะครับ
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={CHECKIN_URL}
            className="inline-flex h-[54px] items-center justify-center gap-2.5 rounded-[15px] bg-orange px-[26px] text-[17px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(255,107,0,0.28)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(255,107,0,0.34)] max-md:h-[50px] max-md:flex-[1_1_100%] max-md:text-base"
          >
            ไปเช็คอินเลย
            <ArrowRight />
          </a>
          {/* A dismissal has no destination, so it must not be an anchor. */}
          <button
            type="button"
            onClick={onLater}
            className="inline-flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-[15px] border-2 border-teal bg-transparent px-[26px] text-[17px] font-bold text-teal transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-[rgba(44,159,162,0.07)] max-md:h-[50px] max-md:flex-[1_1_100%] max-md:text-base"
          >
            ไว้ก่อน
          </button>
        </div>
      </div>
    </motion.div>
  );
}
