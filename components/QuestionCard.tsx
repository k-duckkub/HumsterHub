"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.div
      key={index}
      initial={reduced ? false : { opacity: 0, x: 56, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, x: -56, scale: 0.97 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[30px] border border-black/[0.04] bg-white px-8 pb-8 pt-7 text-left shadow-[0_18px_55px_rgba(0,0,0,0.08)] max-md:rounded-[24px] max-md:px-5 max-md:pb-5 max-md:pt-5"
    >
      <p className="sr-only">คำถามที่ {index + 1} จาก {total}</p>

      <h3 className="mb-8 max-w-[540px] text-[30px] font-bold leading-[1.32] tracking-[-0.035em] text-[#1d1d1f] text-balance max-md:mb-6 max-md:text-[23px]">
        {question.ask}
      </h3>

      <div className="flex flex-col gap-2.5">
        {question.opts.map((o, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => onPick(i)}
              className={[
                "group flex w-full items-center gap-4 rounded-[17px] border px-3.5 py-3 text-left text-[17px] font-semibold text-[#1d1d1f]",
                "transition-[transform,border-color,box-shadow,background] duration-200 ease-[var(--ease-out-soft)]",
                "max-md:gap-3 max-md:px-3 max-md:py-2.5 max-md:text-base",
                isPicked
                  ? "scale-[0.99] border-orange bg-[#fff3e8] shadow-[0_0_0_3px_rgba(255,107,0,0.14)]"
                  : "border-transparent bg-[#fff8f3] enabled:hover:-translate-y-0.5 enabled:hover:bg-[#fff0e3] enabled:hover:shadow-[0_8px_22px_rgba(255,107,0,0.09)] enabled:active:translate-y-0 enabled:active:scale-[0.99]",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full text-[13px] font-bold transition-colors duration-200 max-md:h-[35px] max-md:w-[35px]",
                  isPicked ? "bg-orange text-white" : "bg-white text-[#a54c12] shadow-[inset_0_0_0_1px_rgba(255,107,0,0.16)]",
                ].join(" ")}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1">{o.text}</span>
              <span aria-hidden className="mr-1 text-[27px] font-light leading-none text-[#86868b] transition-transform group-enabled:group-hover:translate-x-0.5">›</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
