"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS, PASS_MARK } from "@/lib/questions";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { QuestionCard } from "./QuestionCard";
import { LootBox } from "./LootBox";
import { PrizeCard } from "./PrizeCard";
import { Hero } from "./Hero";

type Stage = "quiz" | "result" | "prize";

const DECO = [
  "top-[5%] left-[5%] w-[38px] h-[38px] text-[#f6c445]",
  "top-[21%] left-[9%] w-6 h-6 text-teal",
  "top-[47%] left-[3.5%] w-[22px] h-[22px] text-[#3b82f6]",
  "top-[8%] right-[6%] w-[30px] h-[30px] text-orange",
  "top-[27%] right-[10%] w-5 h-5 text-[#f6c445]",
  "top-[53%] right-[4%] w-[25px] h-[25px] text-teal",
];

const DECO_SHAPES = [
  <path key="0" d="M12 2l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.4 6.1 20.5l1.2-6.7-4.8-4.7 6.6-.9z" fill="currentColor" />,
  <path key="1" d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" />,
  <circle key="2" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="5" />,
  <rect key="3" x="4" y="4" width="16" height="16" rx="3" transform="rotate(45 12 12)" fill="currentColor" />,
  <path key="4" d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" />,
  <circle key="5" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="5" />,
];

/**
 * One section, three stages. The chest is not swapped away for the reward: it
 * shrinks and stays above it, so the card reads as having come out of the box
 * the user just opened.
 */
export function QuizFlow() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>("quiz");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const passed = score >= PASS_MARK;
  const kind = passed ? "diamond" : "iron";

  const pick = (optionIndex: number) => {
    if (picked !== null) return;
    setPicked(optionIndex);
    const gained = QUESTIONS[index].opts[optionIndex].score;

    window.setTimeout(
      () => {
        setScore((s) => s + gained);
        setPicked(null);
        if (index < QUESTIONS.length - 1) setIndex((i) => i + 1);
        else setStage("result");
      },
      reduced ? 0 : 260,
    );
  };

  const live =
    stage === "quiz"
      ? `ข้อ ${index + 1} จาก ${QUESTIONS.length}: ${QUESTIONS[index].ask}`
      : stage === "result"
        ? `${passed ? "ผ่านด่านแล้ว" : "ยังไม่ผ่านรอบนี้"} — ${passed ? "ได้รับกล่องเพชร" : "ได้รับกล่องเหล็ก"} คลิกเพื่อเปิดกล่อง`
        : "ยินดีด้วย! ปลดล็อกกิจกรรม SciGameLab Camp แล้ว — เช็คอินเลยไหม?";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_34%,#ffffff_0%,var(--color-warm-ivory)_75%)]">
      <Hero collapsed={stage !== "quiz"} />

      <section className="relative pb-5">
        {DECO.map((c, i) => (
          <span key={i} aria-hidden className={`pointer-events-none absolute z-0 max-md:hidden ${c} ${i % 2 ? "anim-drift-slow" : "anim-drift"}`}>
            <svg viewBox="0 0 24 24" fill="none" className="h-full w-full drop-shadow-[0_4px_6px_rgba(10,26,47,0.14)]">
              {DECO_SHAPES[i]}
            </svg>
          </span>
        ))}

        <div
          className={[
            "mx-auto max-w-[760px] px-6 pt-2 text-center transition-[opacity,transform,height] duration-[450ms] ease-out",
            stage === "quiz" ? "opacity-100" : "pointer-events-none h-0 -translate-y-3.5 scale-[0.96] overflow-hidden opacity-0",
          ].join(" ")}
        >
          <p className="mb-2.5 text-[15px] font-extrabold uppercase tracking-[0.16em] text-orange">
            ✦ Quiz &amp; Reward Flow ✦
          </p>
          <h2 className="mb-2.5 text-[44px] font-extrabold leading-[1.15] tracking-[-0.02em] text-balance max-md:text-[30px]">
            ตอบคำถามสั้น ๆ ก่อนลุยต่อ!
          </h2>
          <p className="text-[19px] text-slate-body max-md:text-base">
            ตอบให้ครบ <b className="font-bold text-orange">3 ข้อ</b> เพื่อปลดล็อกกิจกรรมที่เหมาะกับคุณ
          </p>
        </div>

        <div className="relative z-10 flex min-h-[560px] flex-col items-center justify-center px-6 pb-11 pt-[34px] max-md:min-h-[400px] max-md:px-4 max-md:pb-8 max-md:pt-[22px]">
          <AnimatePresence mode="wait">
            {stage === "quiz" && (
              <div key="quiz" className="w-full max-w-[620px]">
                <AnimatePresence mode="wait">
                  <QuestionCard
                    key={index}
                    question={QUESTIONS[index]}
                    index={index}
                    total={QUESTIONS.length}
                    picked={picked}
                    onPick={pick}
                    reduced={reduced}
                  />
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>

          {stage !== "quiz" && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 26, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full max-w-[620px] text-center ${stage === "prize" ? "mb-[18px]" : ""}`}
            >
              {/* The result copy has done its job once the reward is on screen —
                  the card below carries the message, and two headings compete. */}
              <div
                className={[
                  "overflow-hidden transition-[opacity,max-height,margin] duration-[450ms]",
                  stage === "prize" ? "m-0 max-h-0 opacity-0" : "max-h-[240px] opacity-100",
                ].join(" ")}
              >
                <h3 className="mb-1.5 text-[40px] font-extrabold tracking-[-0.02em] max-md:text-[30px]">
                  {passed ? "ผ่านด่านแล้ว!" : "ยังไม่ผ่านรอบนี้"}
                </h3>
                <p className="mb-1.5 text-[19px] text-slate-body max-md:text-[17px]">
                  {passed ? "คุณปลดล็อกรางวัลพิเศษได้แล้ว" : "ไม่เป็นไร ยังมีของให้เปิดเหมือนกัน"}
                </p>
              </div>

              <LootBox
                kind={kind}
                compact={stage === "prize"}
                reduced={reduced}
                onOpened={() => setStage("prize")}
              />

              <div
                className={[
                  "overflow-hidden transition-[opacity,max-height,margin] duration-[450ms]",
                  stage === "prize" ? "m-0 max-h-0 opacity-0" : "max-h-[160px] opacity-100",
                ].join(" ")}
              >
                <p className="mt-1 text-[18px] font-semibold">
                  {passed ? "คุณได้รับกล่องเพชร!" : "คุณได้รับกล่องเหล็ก"}
                </p>
                <p id="boxHint" className="anim-hint mt-2.5 text-[20px] font-extrabold tracking-[0.01em] text-orange max-md:text-[18px]">
                  {passed ? "✦ คลิกเพื่อเปิดกล่อง ✦" : "✦ ลองเปิดดูว่ามีอะไรอยู่ข้างใน ✦"}
                </p>
              </div>
            </motion.div>
          )}

          {stage === "prize" && (
            <PrizeCard
              reduced={reduced}
              onLater={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
            />
          )}
        </div>

        <p className="sr-only" role="status" aria-live="polite">{live}</p>
      </section>
    </main>
  );
}
