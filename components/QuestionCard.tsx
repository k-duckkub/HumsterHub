"use client";

import { motion } from "framer-motion";
import { OPTION_ICONS, ChevronRight } from "./Icons";
import type { Question } from "@/lib/questions";

type Props = {
  question: Question;
  index: number;
  total: number;
  picked: number | null;
  onPick: (optionIndex: number) => void;
  reduced: boolean;
};

/**
 * Framer rather than GSAP here: each question is a discrete element that
 * mounts and unmounts, which is what AnimatePresence exists for. The chest's
 * open sequence is the opposite shape — one element, many timed beats — and
 * uses a GSAP timeline instead.
 */
export function QuestionCard({ question, index, total, picked, onPick, reduced }: Props) {
  const progress = ((index + 1) / total) * 100;

  return (
    <motion.div
      key={index}
      initial={reduced ? false : { opacity: 0, x: 56, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, x: -56, scale: 0.97 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[var(--radius-lg)] bg-white px-[30px] pt-[30px] pb-[26px] text-left shadow-[0_18px_44px_rgba(10,26,47,0.10)] max-md:rounded-[var(--radius-md)] max-md:px-[18px] max-md:pt-[22px] max-md:pb-5"
    >
      <div className="mb-[22px] flex items-center gap-3.5">
        <span className="shrink-0 text-[17px] font-extrabold text-ink">
          {index + 1} / {total}
        </span>
        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eee]">
          <motion.span
            className="block h-full rounded-full bg-gradient-to-r from-[#ffa04d] to-orange"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
      </div>

      <h3 className="mb-[22px] text-[27px] font-extrabold leading-[1.35] tracking-[-0.01em] text-balance max-md:text-[22px]">
        {question.ask}
      </h3>

      <div className="flex flex-col gap-3">
        {question.opts.map((o, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => onPick(i)}
              className={[
                "group flex w-full items-center gap-3.5 rounded-[var(--radius-md)] border-2 px-[18px] py-[15px] text-left text-[18px] font-semibold text-ink",
                "transition-[transform,border-color,box-shadow,background] duration-200 ease-[var(--ease-out-soft)]",
                "max-md:gap-3 max-md:px-3.5 max-md:py-3 max-md:text-base",
                isPicked
                  ? "scale-[0.975] border-orange bg-[#fff3e8] shadow-[0_0_0_4px_rgba(255,107,0,0.16)]"
                  : "border-[#f0e4d8] bg-[#fdf8f3] enabled:hover:-translate-y-0.5 enabled:hover:border-orange enabled:hover:bg-white enabled:hover:shadow-[0_10px_22px_rgba(255,107,0,0.14)] enabled:active:translate-y-0 enabled:active:scale-[0.985]",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl transition-colors duration-200 max-md:h-[38px] max-md:w-[38px]",
                  isPicked ? "bg-orange text-white" : "bg-soft-orange text-orange",
                ].join(" ")}
              >
                <span className="[&>svg]:h-[23px] [&>svg]:w-[23px]">{OPTION_ICONS[o.icon]}</span>
              </span>
              <span className="min-w-0 flex-1">{o.text}</span>
              <ChevronRight />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
