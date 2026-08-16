import Image from "next/image";

const ORBS = [
  { c: "top-[8%] left-[6%] w-[26px] h-[26px] text-[#3b82f6]", d: 0 },
  { c: "top-[18%] left-[12%] w-[18px] h-[18px] text-teal", d: 1 },
  { c: "top-[52%] left-[4%] w-[22px] h-[22px] text-[#f6c445]", d: 0 },
  { c: "top-[10%] right-[7%] w-[24px] h-[24px] text-orange", d: 1 },
  { c: "top-[30%] right-[12%] w-[16px] h-[16px] text-teal", d: 0 },
  { c: "top-[60%] right-[5%] w-[20px] h-[20px] text-[#3b82f6]", d: 1 },
  { c: "top-[42%] left-[9%] w-[14px] h-[14px] text-orange", d: 1 },
];

const SHAPES = [
  <circle key="c" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="5" />,
  <path key="p" d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />,
  <rect key="r" x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="4" />,
];

/**
 * `collapsed` drives the exit rather than a scroll position: the hero steps
 * aside when the quiz is answered, which is a state change, not a scroll one.
 * Height goes to 0 alongside the fade so the result rises to meet the viewport
 * instead of leaving a hole behind.
 */
export function Hero({ collapsed }: { collapsed: boolean }) {
  return (
    <section
      className={[
        "relative origin-top transition-[opacity,transform,height] duration-500 ease-out",
        collapsed
          ? "h-0 scale-[0.96] -translate-y-3.5 opacity-0 overflow-hidden pointer-events-none"
          : "opacity-100",
      ].join(" ")}
    >
      <h1 className="sr-only">ขอบคุณสำหรับการชำระเงิน</h1>

      <div className="relative">
        <div className="relative overflow-hidden">
          {/* Two crops of one scene: wide for desktop, tighter for phones so the
              wordmark and mascot stay large. Both run full-bleed. */}
          <picture>
            <source media="(min-width: 769px)" srcSet="/assets/thankyou-hero-wide.webp" width={2000} height={685} />
            <Image
              src="/assets/thankyou-hero-mobile.webp"
              width={1060}
              height={685}
              priority
              className="w-full anim-scene"
              alt="Thank you — มาสคอตแฮมสเตอร์ของ HamsterHub ยืนอยู่กลางโต๊ะทำงาน"
            />
          </picture>
        </div>

        {/* Ambient shapes, staggered so they never drift in unison. */}
        {ORBS.map((o, i) => (
          <span key={i} aria-hidden className={`absolute pointer-events-none ${o.c} ${o.d ? "anim-drift-slow" : "anim-drift"}`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_4px_6px_rgba(10,26,47,0.14)]">
              {SHAPES[i % SHAPES.length]}
            </svg>
          </span>
        ))}
      </div>
    </section>
  );
}
