import type { IconName } from "@/lib/questions";
import type { JSX } from "react";

const s = { fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;

export const OPTION_ICONS: Record<IconName, JSX.Element> = {
  pad: (<svg viewBox="0 0 24 24" {...s}><rect x="2" y="7" width="20" height="11" rx="5" /><path d="M7 11v3M5.5 12.5h3M16 12h.01M18.5 14h.01" strokeLinecap="round" /></svg>),
  flask: (<svg viewBox="0 0 24 24" {...s}><path d="M9 3h6M10 3v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 18l-5-9V3" strokeLinejoin="round" /></svg>),
  bulb: (<svg viewBox="0 0 24 24" {...s}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1h6c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3z" strokeLinejoin="round" /></svg>),
  rocket: (<svg viewBox="0 0 24 24" {...s}><path d="M13 3c4 1.5 6.5 5 7 9-4 3.5-8 5-8 5l-4-4s1.5-4 5-8z" strokeLinejoin="round" /><path d="M8 13l-3 1 1 3 3-1M15 9h.01" strokeLinecap="round" /></svg>),
  puzzle: (<svg viewBox="0 0 24 24" {...s}><path d="M10 4a2 2 0 1 1 4 0v1h4v4h-1a2 2 0 1 0 0 4h1v4h-4v-1a2 2 0 1 0-4 0v1H6v-4H5a2 2 0 1 0 0-4h1V5h4z" strokeLinejoin="round" /></svg>),
  heart: (<svg viewBox="0 0 24 24" {...s}><path d="M12 20s-7.5-4.7-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.3 12 20 12 20Z" strokeLinejoin="round" /></svg>),
  bolt: (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2L5 13h5.5L9.5 22 19 10h-6z" /></svg>),
  brush: (<svg viewBox="0 0 24 24" {...s}><path d="M18 3.5l2.5 2.5-9 9-3.5 1 1-3.5z" strokeLinejoin="round" /><path d="M6 16c-1.5 1.5-1 4-3 5 3 .5 5.5 0 6.5-2" strokeLinecap="round" /></svg>),
  star: (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.4 6.1 20.5l1.2-6.7L2.5 9.1l6.6-.9z" /></svg>),
};

export const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5">
    <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5 shrink-0 text-[#c9b6a6] transition-[transform,color] duration-200 group-hover:translate-x-[3px] group-hover:text-orange">
    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-[18px] h-[18px] text-orange">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.9" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-[18px] h-[18px] text-orange">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="1.9" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.9" />
  </svg>
);
