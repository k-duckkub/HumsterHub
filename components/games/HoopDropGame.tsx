"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameCanvas } from "@/lib/useGameCanvas";
import { play } from "@/lib/sound";
import type { GameProps } from "./types";

const NEEDED = 2;
const HOOPS = 3;
const HOOP_TINTS = ["#FF6B00", "#FF9138", "#D95700"];

type Hoop = { x: number; y: number; tint: string; resolved: boolean; pop: number };

type World = {
  ready: boolean;
  started: boolean;
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
    started: false,
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
    w.started = true;
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
        x: w * 0.92 + gap * i,
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

    if (!s.over && s.started) {
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
    sky.addColorStop(0, "#FFF0E3");
    sky.addColorStop(0.62, "#FFF8F1");
    sky.addColorStop(1, "#FCE8D8");
    c.fillStyle = sky;
    c.fillRect(-6, -6, w + 12, h + 12);

    const sunset = c.createRadialGradient(w * 0.78, h * 0.22, 0, w * 0.78, h * 0.22, 145 * k);
    sunset.addColorStop(0, "rgba(255,255,255,0.90)");
    sunset.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sunset;
    c.fillRect(0, 0, w, h);

    c.fillStyle = "rgba(255,255,255,0.72)";
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 149 + 24) % (w + 100)) - 50;
      const cy = h * (0.12 + (i % 3) * 0.14);
      c.beginPath();
      c.ellipse(cx, cy, (36 + (i % 2) * 18) * k, 4 * k, -0.08, 0, Math.PI * 2);
      c.fill();
    }

    // A hand-built rooftop silhouette gives the field scale and a clear
    // horizon. Fixed geometry keeps it from flickering between frames.
    c.fillStyle = "#E8D8CA";
    c.beginPath();
    c.moveTo(0, h);
    c.lineTo(0, h * 0.78);
    for (let x = 0, i = 0; x <= w + 45 * k; x += (32 + (i % 3) * 11) * k, i++) {
      const roof = h * (0.71 + ((i * 7) % 5) * 0.025);
      c.lineTo(x, roof);
      c.lineTo(x + (25 + (i % 3) * 9) * k, roof);
    }
    c.lineTo(w, h);
    c.closePath();
    c.fill();

    c.strokeStyle = "rgba(29,29,31,0.045)";
    c.lineWidth = 1 * k;
    for (let y = h * 0.55; y < h; y += 32 * k) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }

    for (const hoop of s.hoops) {
      if (hoop.x < -60 * k) continue;
      hoop.pop = Math.max(0, hoop.pop - dt * 3);
      const grow = 1 + hoop.pop * 0.16;
      c.save();
      c.translate(hoop.x, hoop.y);
      c.scale(grow, grow);
      c.shadowColor = "rgba(0,0,0,0.13)";
      c.shadowBlur = 10 * k;
      c.shadowOffsetY = 5 * k;
      c.strokeStyle = "rgba(255,255,255,0.92)";
      c.lineWidth = 20 * k;
      c.beginPath();
      c.ellipse(3 * k, 4 * k, 28 * k, openY, 0, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = hoop.tint;
      c.lineWidth = 12 * k;
      c.lineCap = "round";
      c.beginPath();
      c.ellipse(0, 0, 26 * k, openY, 0, 0, Math.PI * 2);
      c.stroke();
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
      c.strokeStyle = "rgba(255,255,255,0.82)";
      c.lineWidth = 2.5 * k;
      c.beginPath();
      c.ellipse(-6 * k, -6 * k, 22 * k, openY * 0.82, 0, Math.PI * 0.75, Math.PI * 1.5);
      c.stroke();

      c.fillStyle = "rgba(255,255,255,0.86)";
      for (let tick = -2; tick <= 2; tick++) {
        c.fillRect(-2 * k, tick * 18 * k - 2 * k, 4 * k, 4 * k);
      }
      c.restore();
    }

    for (let trail = 4; trail >= 1; trail--) {
      c.globalAlpha = (5 - trail) * 0.025;
      c.fillStyle = "#E87520";
      c.beginPath();
      c.arc(ballX - trail * 11 * k, s.ballY - s.vy * 0.006 * trail, ballR * (1 - trail * 0.09), 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    if (!s.started) {
      c.save();
      c.strokeStyle = "rgba(29,29,31,0.16)";
      c.lineWidth = 1.5 * k;
      c.setLineDash([7 * k, 8 * k]);
      c.beginPath();
      c.moveTo(ballX + ballR * 1.7, s.ballY);
      c.lineTo(w * 0.78, s.ballY);
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = "rgba(29,29,31,0.48)";
      c.font = `600 ${11 * k}px "Noto Sans Thai", system-ui, sans-serif`;
      c.textAlign = "left";
      c.fillText("พร้อมแล้ว", ballX - ballR, s.ballY - 34 * k);
      c.restore();
    }

    c.save();
    c.translate(ballX, s.ballY);
    c.rotate(s.spin);
    c.shadowColor = "rgba(0,0,0,0.46)";
    c.shadowBlur = 11 * k;
    c.shadowOffsetY = 5 * k;
    const leather = c.createRadialGradient(-6 * k, -7 * k, 1 * k, 0, 0, ballR * 1.2);
    leather.addColorStop(0, "#FFB34D");
    leather.addColorStop(0.62, "#E87520");
    leather.addColorStop(1, "#9B3714");
    c.fillStyle = leather;
    c.beginPath();
    c.arc(0, 0, ballR, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(70,25,12,0.78)";
    c.lineWidth = 1.8 * k;
    c.beginPath();
    c.moveTo(-ballR, 0);
    c.lineTo(ballR, 0);
    c.moveTo(0, -ballR);
    c.lineTo(0, ballR);
    c.moveTo(-ballR * 0.82, -ballR * 0.55);
    c.bezierCurveTo(-ballR * 0.18, -ballR * 0.12, -ballR * 0.18, ballR * 0.12, -ballR * 0.82, ballR * 0.55);
    c.moveTo(ballR * 0.82, -ballR * 0.55);
    c.bezierCurveTo(ballR * 0.18, -ballR * 0.12, ballR * 0.18, ballR * 0.12, ballR * 0.82, ballR * 0.55);
    c.stroke();
    c.restore();

    for (const p of s.pops) {
      c.globalAlpha = Math.max(0, p.t);
      c.fillStyle = "#D95700";
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
      <div className="pointer-events-none absolute left-4 right-16 top-4 flex items-center gap-3">
        <span className="rounded-full border border-orange/10 bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-orange-dark shadow-[0_5px_18px_rgba(255,107,0,0.10)] backdrop-blur-xl">
          คะแนน {score}/{NEEDED}
        </span>
        <span className="text-[11px] font-medium text-[#6e6e73]">
          ห่วง {Math.min(cleared + 1, HOOPS)}/{HOOPS}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center gap-3 text-[#86868b]">
        <span className="h-px flex-1 bg-black/10" />
        <p className="text-[11px] font-medium">แตะเพื่อกระโดด</p>
        <span className="h-px flex-1 bg-black/10" />
      </div>
    </div>
  );
}
