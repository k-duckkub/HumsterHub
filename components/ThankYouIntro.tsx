"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

/** A sealed letter flies in, lands with weight, then opens the Thank You flow. */
export function ThankYouIntro({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLButtonElement>(null);
  const plane = useRef<HTMLSpanElement>(null);
  const flutter = useRef<HTMLSpanElement>(null);
  const frameImages = useRef<(HTMLImageElement | null)[]>([]);
  const finalEnvelope = useRef<HTMLImageElement>(null);
  const streak = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const impact = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const [landed, setLanded] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    gsap.registerPlugin(MotionPathPlugin);
    const media = gsap.matchMedia();

    media.add(
      { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        if (context.conditions?.reduced) {
          gsap.set(letter.current, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1 });
          gsap.set([plane.current, flutter.current], { rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1 });
          gsap.set(shadow.current, { opacity: 0.24, scale: 1 });
          gsap.set(streak.current, { opacity: 0 });
          gsap.set(halo.current, { opacity: 1, scale: 1 });
          gsap.set(impact.current, { opacity: 0 });
          gsap.set(frameImages.current, { opacity: 0 });
          gsap.set(finalEnvelope.current, { opacity: 1 });
          setLanded(true);
          return;
        }

        const w = window.innerWidth;
        const h = window.innerHeight;
        const route = [
          `M ${-0.62 * w},${0.16 * h}`,
          `C ${-0.25 * w},${0.36 * h} ${0.20 * w},${-0.30 * h} ${0.48 * w},${-0.08 * h}`,
          `C ${0.62 * w},${0.05 * h} ${0.30 * w},${0.32 * h} ${0.04 * w},${0.08 * h}`,
          `C ${-0.045 * w},${0.005 * h} ${-0.025 * w},${-0.01 * h} 0,0`,
        ].join(" ");

        const flight = gsap.timeline({ onComplete: () => setLanded(true) });
        const frames = frameImages.current.filter((frame): frame is HTMLImageElement => frame !== null);
        animation.current = flight;
        flight
          .set(letter.current, { autoAlpha: 1, x: -0.62 * w, y: 0.16 * h, scale: 0.42, force3D: true })
          .set(plane.current, {
            rotationZ: 0,
            rotationY: 0,
            rotationX: 0,
            transformPerspective: 1100,
            transformOrigin: "50% 50%",
            force3D: true,
          })
          .set(flutter.current, { rotationX: 0, rotationY: 0, scaleX: 1, scaleY: 1 })
          .set(frames, { opacity: 0 })
          .set(frames[0], { opacity: 1 })
          .set(finalEnvelope.current, { opacity: 0 })
          .set(streak.current, { opacity: 0, scaleX: 0.6 })
          .set(shadow.current, { opacity: 0, scaleX: 0.25, scaleY: 0.45, y: 46 })
          .set(impact.current, { opacity: 0, scale: 0.45 })
          .to(letter.current, { x: -0.50 * w, scale: 0.48, duration: 0.34, ease: "power2.out" }, 0)
          .to(plane.current, { scaleX: 0.92, scaleY: 1.07, duration: 0.34, ease: "power2.out" }, 0)
          .to(letter.current, { x: -0.62 * w, duration: 0.16, ease: "power4.in" }, 0.34)
          .to(plane.current, { scaleX: 1.1, scaleY: 0.89, duration: 0.16, ease: "power4.in" }, 0.34)
          .to(letter.current, {
            motionPath: { path: route, autoRotate: false, alignOrigin: [0.5, 0.5] },
            duration: 2.05,
            ease: "power1.inOut",
          }, 0.50)
          .to(letter.current, { scale: 1, duration: 1.82, ease: "power1.out" }, 0.50)
          .to(plane.current, {
            scaleX: 1,
            scaleY: 1,
            duration: 2.05,
            ease: "sine.inOut",
          }, 0.50)
          .fromTo(streak.current, { opacity: 0, scaleX: 0.58 }, {
            opacity: 0.62,
            scaleX: 1.08,
            duration: 0.18,
            ease: "power2.out",
          }, 0.54)
          .to(streak.current, { opacity: 0, scaleX: 0.72, duration: 0.42, ease: "power2.in" }, 1.72)
          .to(shadow.current, { opacity: 0.24, scaleX: 1, scaleY: 1, y: 26, duration: 0.72, ease: "power2.out" }, 1.86)
          .to(plane.current, {
            scaleX: 1.08,
            scaleY: 0.91,
            y: 7,
            duration: 0.08,
            ease: "power4.in",
          }, 2.55)
          .to(plane.current, { scaleX: 0.975, scaleY: 1.025, y: -3, duration: 0.15, ease: "power3.out" }, 2.63)
          .to(plane.current, { scaleX: 1, scaleY: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }, 2.78)
          .fromTo(impact.current, { opacity: 0.42, scale: 0.5 }, {
            opacity: 0,
            scale: 1.08,
            duration: 0.4,
            ease: "power2.out",
            immediateRender: false,
          }, 2.58)
          .to(halo.current, { opacity: 1, scale: 1, duration: 0.48, ease: "power2.out" }, 2.60)
          .to(shadow.current, { opacity: 0.18, scaleX: 0.82, scaleY: 0.78, y: 21, duration: 0.34, ease: "power2.out" }, 2.62);

        // The artwork itself owns the rotation. Each frame is the same canonical
        // envelope advanced by exactly 7.5 degrees, so the seal, flap and shadow
        // cannot drift away from the angle of travel.
        frames.forEach((_, frameIndex) => {
          const at = 0.54 + frameIndex * 0.04;
          flight.set(frames, { opacity: 0 }, at).set(frames[frameIndex], { opacity: 1 }, at);
        });
        flight
          .set(frames, { opacity: 0 }, 2.48)
          .set(finalEnvelope.current, { opacity: 1 }, 2.48);

        return () => flight.kill();
      },
    );

    return () => {
      media.revert();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const open = () => {
    if (!landed || opening) return;
    setOpening(true);
    animation.current?.kill();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }
    gsap.timeline({ onComplete })
      .to(plane.current, { scale: 1.07, y: -9, duration: 0.24, ease: "power2.out" }, 0)
      .to(root.current, { opacity: 0, duration: 0.38, ease: "power2.inOut" }, 0.1);
  };

  return (
    <div ref={root} className="thankyou-letter-intro">
      <div className="thankyou-letter-orbit" aria-hidden="true" />
      <div ref={halo} className="thankyou-letter-halo" aria-hidden="true" />
      <div ref={impact} className="thankyou-letter-impact" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
      </div>

      <div className="thankyou-letter-arrival">
        <div ref={shadow} className="thankyou-envelope-shadow" aria-hidden="true" />
        <button
          ref={letter}
          type="button"
          disabled={!landed || opening}
          onClick={open}
          className="thankyou-letter-button"
          aria-label="เปิดซองจดหมายเพื่อเข้าสู่หน้า Thank You"
        >
          <span ref={streak} className="thankyou-letter-streak" aria-hidden="true"><i /><i /><i /></span>
          <span ref={plane} className="thankyou-letter-spin">
            <span ref={flutter} className="thankyou-envelope-surface">
              {Array.from({ length: 48 }, (_, index) => (
                <Image
                  key={index}
                  ref={(node) => { frameImages.current[index] = node; }}
                  src={`/assets/envelope-rotation-frames/frame-${String(index + 1).padStart(2, "0")}.png`}
                  alt=""
                  width={600}
                  height={600}
                  priority
                  draggable={false}
                  className="thankyou-letter-art thankyou-envelope-frame"
                />
              ))}
              <Image
                ref={finalEnvelope}
                src="/assets/thankyou-envelope-straight-v2.png"
                alt=""
                width={1536}
                height={1024}
                priority
                draggable={false}
                className="thankyou-letter-art thankyou-envelope-final"
              />
            </span>
          </span>
        </button>

        <div className={`thankyou-letter-prompt${landed ? " is-visible" : ""}`}>
          <p className="text-center text-[18px] font-bold text-[#583c3b] max-sm:text-base">จดหมายถึงคุณ</p>
          <p className="mt-1 text-center text-[15px] text-[#856b67] max-sm:text-sm">กดซองจดหมายเพื่อเข้าสู่หน้า Thank You</p>
        </div>
      </div>
    </div>
  );
}
