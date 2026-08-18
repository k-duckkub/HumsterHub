import Image from "next/image";

const ORBS = [
  { c: "top-[34%] left-[1.5%] w-[15px] h-[15px] text-teal opacity-60", d: 0 },
  { c: "top-[70%] left-[3%] w-[13px] h-[13px] text-[#3b82f6] opacity-55", d: 1 },
  { c: "top-[32%] right-[1.5%] w-[14px] h-[14px] text-orange opacity-60", d: 1 },
  { c: "top-[69%] right-[3%] w-[12px] h-[12px] text-teal opacity-55", d: 0 },
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
          {/* The supplied scene already includes its finished wave edge, so
              the same source stays intact at every breakpoint. */}
          <picture>
            <Image
              src="/assets/thankyou-hero-v2.png"
              width={1680}
              height={938}
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
