"use client";

import { useEffect, useState } from "react";

/**
 * Reads prefers-reduced-motion and keeps up if the user changes it mid-session.
 *
 * Starts false rather than reading synchronously: the server has no matchMedia,
 * and a first paint that disagreed with the server's would hydrate-mismatch.
 * Every consumer treats false as "animate", which is the safe default to
 * correct one frame later.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
