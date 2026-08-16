"use client";

import { useCallback, useEffect, useState } from "react";

export type SoundName =
  | "click"   // tile / option tap
  | "place"   // X or O lands
  | "swoosh"  // ball through a hoop
  | "bounce"  // pong paddle
  | "win"     // encounter passed
  | "lose"    // encounter failed
  | "water"   // the shower turning on
  | "open";   // reward box

const KEY = "hh-sound";

let ctx: AudioContext | null = null;
let on = true;
const listeners = new Set<(v: boolean) => void>();

/**
 * Synthesised rather than sampled: eight one-shot effects would otherwise mean
 * eight network requests and a decode budget, for sounds that are all under
 * half a second of sine and filtered noise anyway.
 *
 * The context is created on the first play() — which can only follow a tap,
 * since nothing here runs on load — so autoplay policy is satisfied without a
 * separate unlock step.
 */
let audioBroken = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || audioBroken) return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    // Construction throws on devices with no output and in some locked-down
    // embeds. Sound is decoration; nothing above may fail because of it.
    audioBroken = true;
    return null;
  }
}

type ToneOpts = {
  from: number;
  to?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  at?: number;
};

function tone(ac: AudioContext, { from, to, dur, type = "sine", gain = 0.16, at = 0 }: ToneOpts) {
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);

  // A hard start or stop on a gain node is an audible click, so every effect
  // gets a short ramp in and a ramp to (near) zero out.
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.012, dur / 3));
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(ac: AudioContext, dur: number, gain: number, freq: number, q = 1, at = 0) {
  const t0 = ac.currentTime + at;
  const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq, t0);
  filter.Q.value = q;
  const amp = ac.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export function play(name: SoundName) {
  if (!on) return;
  const ac = audio();
  if (!ac) return;
  try {
    emit(ac, name);
  } catch {
    audioBroken = true;
  }
}

function emit(ac: AudioContext, name: SoundName) {
  switch (name) {
    case "click":
      tone(ac, { from: 620, to: 900, dur: 0.06, type: "triangle", gain: 0.1 });
      break;
    case "place":
      tone(ac, { from: 380, to: 720, dur: 0.11, type: "triangle", gain: 0.14 });
      break;
    case "swoosh":
      noise(ac, 0.24, 0.11, 1500, 0.9);
      tone(ac, { from: 900, to: 1600, dur: 0.16, type: "sine", gain: 0.08 });
      break;
    case "bounce":
      tone(ac, { from: 300, to: 190, dur: 0.08, type: "square", gain: 0.09 });
      break;
    case "win":
      // Major triad arpeggio — the shortest phrase that reads as "yes".
      tone(ac, { from: 660, dur: 0.1, type: "triangle", gain: 0.14 });
      tone(ac, { from: 880, dur: 0.1, type: "triangle", gain: 0.14, at: 0.09 });
      tone(ac, { from: 1320, dur: 0.2, type: "triangle", gain: 0.13, at: 0.18 });
      break;
    case "lose":
      tone(ac, { from: 400, to: 180, dur: 0.3, type: "sawtooth", gain: 0.09 });
      break;
    case "water":
      noise(ac, 0.85, 0.075, 2600, 0.55);
      noise(ac, 0.7, 0.05, 900, 0.7, 0.06);
      break;
    case "open":
      tone(ac, { from: 520, to: 1180, dur: 0.28, type: "triangle", gain: 0.15 });
      noise(ac, 0.4, 0.07, 3200, 0.7, 0.16);
      break;
  }
}

/** Shared across every mount so the header toggle and the games agree. */
export function useSound() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Storage throws rather than returning null in a few embedded contexts, and
    // losing the preference is a better outcome than losing the page.
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved !== null) {
        on = saved === "1";
        setEnabled(on);
      }
    } catch { /* preference simply does not persist */ }

    listeners.add(setEnabled);
    return () => { listeners.delete(setEnabled); };
  }, []);

  const toggle = useCallback(() => {
    on = !on;
    try {
      window.localStorage.setItem(KEY, on ? "1" : "0");
    } catch { /* preference simply does not persist */ }
    listeners.forEach((fn) => fn(on));
    if (on) play("click");
  }, []);

  return { enabled, toggle, play };
}
