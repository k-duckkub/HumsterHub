"use client";

import { useEffect, useRef } from "react";

type Frame = (c: CanvasRenderingContext2D, dt: number, w: number, h: number) => void;

/**
 * One rAF loop and one ResizeObserver, both torn down on unmount — which is
 * the whole reason this is shared. Hoop Drop and Pong both swap out mid-session
 * while their timers are live, and a loop that outlived its component would
 * keep drawing into a detached canvas.
 *
 * `frame` is read through a ref so the loop never restarts when the callback's
 * closure changes, which it does on every render that touches game state.
 */
export function useGameCanvas(frame: Frame) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(frame);

  useEffect(() => { latest.current = frame; });

  useEffect(() => {
    const cv = canvas.current;
    const c = cv?.getContext("2d");
    if (!cv || !c) return;

    let raf = 0;
    let last = performance.now();
    const size = { w: 0, h: 0 };

    const resize = () => {
      // Capped at 2: a 3x phone gains no visible sharpness on these flat shapes
      // and triples the fill cost per frame.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      size.w = r.width;
      size.h = r.height;
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    const tick = (t: number) => {
      // Clamped so a backgrounded tab does not resume with a multi-second step
      // and teleport the ball through everything.
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      if (size.w > 0) latest.current(c, dt, size.w, size.h);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return canvas;
}
