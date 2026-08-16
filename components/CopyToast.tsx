"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type CopyFn = (value: string) => void;
const CopyCtx = createContext<CopyFn>(() => {});

/**
 * Wraps the page so the LINE ID and the account number can share one toast.
 * Both live in different corners of the layout, so a shared context beats
 * threading state through the tree or giving each button its own toast.
 */
export function CopyProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const copy = useCallback<CopyFn>((value) => {
    // Falls back to showing the value rather than failing silently: clipboard
    // access is refused in plenty of embedded and insecure contexts, and the
    // user can still read it off the screen and type it.
    navigator.clipboard
      ?.writeText(value)
      .then(() => setMessage(`คัดลอก ${value} แล้ว`))
      .catch(() => setMessage(value));

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 1800);
  }, []);

  return (
    <CopyCtx.Provider value={copy}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={[
          "fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-white",
          "transition-[opacity,transform] duration-200",
          message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        ].join(" ")}
      >
        {message}
      </div>
    </CopyCtx.Provider>
  );
}

export function CopyButton({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const copy = useContext(CopyCtx);
  return (
    <button type="button" onClick={() => copy(value)} className={className}>
      {children}
    </button>
  );
}
