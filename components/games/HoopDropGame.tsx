"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameCanvas } from "@/lib/useGameCanvas";
import { play } from "@/lib/sound";
import type { GameProps } from "./types";

const NEEDED = 2;
const HOOPS = 3;
const HOOP_TINTS = ["#EF4B3C", "#3B82F6", "#F2A50E"];

type Hoop = { x: number; y: number; tint: string; resolved: boolean; pop: number };

type World = {
  ready: boolean;
  /** Authoritative score. State mirrors it for the header, but the win check
   *  runs in the same frame as the last hoop and cannot wait for a re-render. */
  score: number;
  ballY: number;
  vy: number;
  jump: number;
  spin: number;
  hoops: Hoop[];
  respawns: number;
  shake: number;
  pops: { x: number; y: number; t: number }[];
  over: boolean;
};

/**
 * Flappy geometry: the ball holds a fixed x and the hoops travel to meet it,
 * which keeps the playfield stationary and the collision test one-dimensional.
 *
 * Everything scales off the canvas height so the same numbers feel the same on
 * a 390px phone and a 520px desktop frame — the brief's px/s values are quoted
 * against a 600px-tall field.
 */
export function HoopDropGame({ onFinish, reduced }: GameProps) {
  const [score, setScore] = useState(0);
  const [cleared, setCleared] = useState(0);
  const finished = useRef(false);
  const endTimer = useRef<number | undefined>(undefined);

  const world = useRef<World>({
    ready: false,
    score: 0,
    ballY: 0,
    vy: 0,
    jump: 0,
    spin: 0,
    hoops: [],
    respawns: 1,
    shake: 0,
    pops: [],
    over: false,
  });

  useEffect(() => () => window.clearTimeout(endTimer.current), []);

  const finish = useCallback(
    (won: boolean) => {
      if (finished.current) return;
      finished.current = true;
      world.current.over = true;
      play(won ? "win" : "lose");
      endTimer.current = window.setTimeout(() => onFinish(won), reduced ? 60 : 780);
    },
    [onFinish, reduced],
  );

  const jump = useCallback(() => {
    const w = world.current;
    if (!w.ready || w.over) return;
    w.vy = -w.jump;
    play("bounce");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "Enter") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  const canvas = useGameCanvas((c, dt, w, h) => {
    const s = world.current;
    const k = h / 600;

    if (!s.ready) {
      s.ready = true;
      s.ballY = h * 0.42;
      s.vy = 0;
      const gap = Math.max(w * 0.72, 165 * k * 1.75);
      s.hoops = Array.from({ length: HOOPS }, (_, i) => ({
        x: w + w * 0.35 + gap * i,
        y: h * (0.32 + Math.random() * 0.36),
        tint: HOOP_TINTS[i % HOOP_TINTS.length],
        resolved: false,
        pop: 0,
      }));
    }

    const ballX = w * 0.32;
    const ballR = 17 * k;
    const openY = 60 * k;
    s.jump = 455 * k;

    if (!s.over) {
      s.vy += 1200 * k * dt;
      s.ballY += s.vy * dt;
      s.spin += s.vy * dt * 0.012;

      for (const hoop of s.hoops) {
        const before = hoop.x;
        hoop.x -= 168 * k * dt;
        if (!hoop.resolved && before > ballX && hoop.x <= ballX) {
          hoop.resolved = true;
          const through = Math.abs(s.ballY - hoop.y) < openY - ballR * 0.55;
          if (through) {
            hoop.pop = 1;
            s.pops.push({ x: ballX, y: s.ballY, t: 1 });
            play("swoosh");
            s.score += 1;
            setScore(s.score);
          } else {
            s.shake = 1;
            play("bounce");
          }
          setCleared((v) => v + 1);
        }
      }

      // One free save. A single unlucky tap early would otherwise end a round
      // the player was winning, which is the opposite of the 65–80% target.
      if (s.ballY > h + 50 || s.ballY < -60) {
        if (s.respawns > 0) {
          s.respawns -= 1;
          s.ballY = h * 0.42;
          s.vy = 0;
          s.shake = 1;
        } else {
          finish(s.score >= NEEDED);
        }
      }

      if (s.hoops.every((hp) => hp.resolved) && !finished.current) {
        finish(s.score >= NEEDED);
      }
    }

    s.shake = Math.max(0, s.shake - dt * 4);
    for (const p of s.pops) p.t -= dt * 1.4;
    s.pops = s.pops.filter((p) => p.t > 0);

    // ── paint ──
    c.save();
    if (s.shake > 0 && !reduced) {
      c.translate((Math.random() - 0.5) * 4 * s.shake, (Math.random() - 0.5) * 4 * s.shake);
    }

    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#BFE6FF");
    sky.addColorStop(1, "#E9F7FF");
    c.fillStyle = sky;
    c.fillRect(-6, -6, w + 12, h + 12);

    c.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 137 + 40) % (w + 80)) - 40;
      const cy = h * (0.14 + (i % 3) * 0.22);
      c.beginPath();
      c.ellipse(cx, cy, 34 * k, 15 * k, 0, 0, Math.PI * 2);
      c.fill();
    }

    for (const hoop of s.hoops) {
      if (hoop.x < -60 * k) continue;
      hoop.pop = Math.max(0, hoop.pop - dt * 3);
      const grow = 1 + hoop.pop * 0.16;
      c.save();
      c.translate(hoop.x, hoop.y);
      c.scale(grow, grow);
      c.strokeStyle = hoop.tint;
      c.lineWidth = 13 * k;
      c.lineCap = "round";
      c.beginPath();
      c.ellipse(0, 0, 26 * k, openY, 0, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.5)";
      c.lineWidth = 4 * k;
      c.beginPath();
      c.ellipse(-6 * k, -6 * k, 22 * k, openY * 0.82, 0, Math.PI * 0.75, Math.PI * 1.5);
      c.stroke();
      c.restore();
    }

    c.save();
    c.translate(ballX, s.ballY);
    c.rotate(s.spin);
    c.fillStyle = "#E8802B";
    c.beginPath();
    c.arc(0, 0, ballR, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(90,40,10,0.6)";
    c.lineWidth = 2 * k;
    c.beginPath();
    c.moveTo(-ballR, 0);
    c.lineTo(ballR, 0);
    c.moveTo(0, -ballR);
    c.lineTo(0, ballR);
    c.stroke();
    c.restore();

    for (const p of s.pops) {
      c.globalAlpha = Math.max(0, p.t);
      c.fillStyle = "#0A1A2F";
      c.font = `700 ${20 * k}px system-ui, sans-serif`;
      c.textAlign = "center";
      c.fillText("+1", p.x, p.y - (1 - p.t) * 40 * k);
      c.globalAlpha = 1;
    }

    c.restore();
  });

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvas}
        onPointerDown={(e) => { e.preventDefault(); jump(); }}
        className="h-full w-full touch-none"
        style={{ touchAction: "none" }}
      />
      {/* Inset on the right so the pill never runs under the restart button. */}
      <div className="pointer-events-none absolute left-3 right-16 top-3 flex justify-center">
        <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-[14px] font-extrabold text-ink shadow-sm">
          ลอด {score}/{NEEDED} · ห่วง {Math.min(cleared + 1, HOOPS)}/{HOOPS}
        </span>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[13px] font-bold text-ink/55">
        แตะเพื่อกระโดด
      </p>
    </div>
  );
}
