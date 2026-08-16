"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameCanvas } from "@/lib/useGameCanvas";
import { play } from "@/lib/sound";
import type { GameProps } from "./types";

const TARGET = 3;
/** Slow enough to be beatable on purpose. A paddle that tracks the ball
 *  exactly turns first-to-three into first-to-never. */
const AI_TRACK = 0.045;

type World = {
  ready: boolean;
  px: number;
  tx: number;
  ax: number;
  bx: number;
  by: number;
  vx: number;
  vy: number;
  playerScore: number;
  aiScore: number;
  /** Seconds left on the serve countdown; 0 means the rally is live. */
  wait: number;
  serveDown: boolean;
  shake: number;
  over: boolean;
};

export function PongGame({ onFinish, reduced }: GameProps) {
  const [scores, setScores] = useState({ you: 0, ai: 0 });
  const [count, setCount] = useState(3);
  const [serving, setServing] = useState(true);

  const finished = useRef(false);
  const endTimer = useRef<number | undefined>(undefined);

  const world = useRef<World>({
    ready: false,
    px: 0, tx: 0, ax: 0,
    bx: 0, by: 0, vx: 0, vy: 0,
    playerScore: 0,
    aiScore: 0,
    wait: 1.5,
    serveDown: Math.random() < 0.5,
    shake: 0,
    over: false,
  });

  useEffect(() => () => window.clearTimeout(endTimer.current), []);

  const finish = useCallback(
    (won: boolean) => {
      if (finished.current) return;
      finished.current = true;
      world.current.over = true;
      setServing(false);
      play(won ? "win" : "lose");
      endTimer.current = window.setTimeout(() => onFinish(won), reduced ? 60 : 820);
    },
    [onFinish, reduced],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = world.current;
      const step = 46;
      if (e.code === "ArrowLeft" || e.code === "KeyA") { s.tx -= step; e.preventDefault(); }
      if (e.code === "ArrowRight" || e.code === "KeyD") { s.tx += step; e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canvas = useGameCanvas((c, dt, w, h) => {
    const s = world.current;
    const k = h / 600;

    const paddleW = Math.max(w * 0.26, 74 * k);
    const paddleH = 13 * k;
    // Inset far enough to clear the score pill and the hint line. At 30px the
    // paddles sat underneath both and the game looked like it had none.
    const playerY = h - 64 * k;
    const aiY = 64 * k;
    const ballR = 9 * k;
    const maxSpeed = h * 1.1;

    if (!s.ready) {
      s.ready = true;
      s.px = s.tx = s.ax = w / 2;
      s.bx = w / 2;
      s.by = h / 2;
    }

    // Frame-rate independent version of the brief's `x += (target - x) * 0.2`.
    const ease = (factor: number) => 1 - Math.pow(1 - factor, dt * 60);

    s.tx = Math.max(paddleW / 2, Math.min(w - paddleW / 2, s.tx));
    s.px += (s.tx - s.px) * ease(0.2);
    s.ax += (s.bx - s.ax) * ease(AI_TRACK);
    s.ax = Math.max(paddleW / 2, Math.min(w - paddleW / 2, s.ax));

    if (!s.over) {
      if (s.wait > 0) {
        s.wait = Math.max(0, s.wait - dt);
        s.bx = w / 2;
        s.by = h / 2;
        setServing(true);
        setCount(Math.max(1, Math.ceil(s.wait / 0.5)));
        if (s.wait === 0) {
          setServing(false);
          const speed = h * 0.55;
          const angle = (Math.random() * 0.5 - 0.25) * Math.PI;
          s.vx = Math.sin(angle) * speed;
          s.vy = Math.cos(angle) * speed * (s.serveDown ? 1 : -1);
        }
      } else {
        s.bx += s.vx * dt;
        s.by += s.vy * dt;

        if (s.bx <= ballR) { s.bx = ballR; s.vx = Math.abs(s.vx); play("bounce"); }
        if (s.bx >= w - ballR) { s.bx = w - ballR; s.vx = -Math.abs(s.vx); play("bounce"); }

        const hit = (paddleX: number, paddleY: number, downward: boolean) => {
          const crossing = downward
            ? s.vy > 0 && s.by + ballR >= paddleY - paddleH / 2 && s.by - ballR <= paddleY + paddleH
            : s.vy < 0 && s.by - ballR <= paddleY + paddleH / 2 && s.by + ballR >= paddleY - paddleH;
          if (!crossing || Math.abs(s.bx - paddleX) > paddleW / 2 + ballR) return false;

          s.by = downward ? paddleY - paddleH / 2 - ballR : paddleY + paddleH / 2 + ballR;
          s.vy = downward ? -Math.abs(s.vy) : Math.abs(s.vy);
          // Angling off the paddle edge is what makes the rally feel steered
          // rather than reflected.
          s.vx += ((s.bx - paddleX) / (paddleW / 2)) * 150 * k;

          const speed = Math.hypot(s.vx, s.vy);
          const next = Math.min(speed * 1.03, maxSpeed);
          s.vx *= next / speed;
          s.vy *= next / speed;
          play("bounce");
          return true;
        };

        hit(s.px, playerY, true);
        hit(s.ax, aiY, false);

        const point = (mine: boolean) => {
          if (mine) s.playerScore += 1;
          else s.aiScore += 1;
          setScores({ you: s.playerScore, ai: s.aiScore });
          s.shake = 1;
          s.serveDown = mine;
          s.wait = 1.5;
          if (s.playerScore >= TARGET) finish(true);
          else if (s.aiScore >= TARGET) finish(false);
        };

        if (s.by > h + ballR * 2) point(false);
        else if (s.by < -ballR * 2) point(true);
      }
    }

    s.shake = Math.max(0, s.shake - dt * 3);

    // ── paint ──
    c.save();
    if (s.shake > 0 && !reduced) {
      c.translate((Math.random() - 0.5) * 5 * s.shake, (Math.random() - 0.5) * 5 * s.shake);
    }

    c.fillStyle = "#12314F";
    c.fillRect(-6, -6, w + 12, h + 12);

    c.strokeStyle = "rgba(255,255,255,0.22)";
    c.lineWidth = 2 * k;
    c.setLineDash([10 * k, 10 * k]);
    c.beginPath();
    c.moveTo(0, h / 2);
    c.lineTo(w, h / 2);
    c.stroke();
    c.setLineDash([]);

    c.fillStyle = "rgba(255,255,255,0.10)";
    c.font = `800 ${64 * k}px system-ui, sans-serif`;
    c.textAlign = "center";
    c.fillText(String(s.aiScore), w / 2, h / 2 - 22 * k);
    c.fillText(String(s.playerScore), w / 2, h / 2 + 74 * k);

    const paddle = (x: number, y: number, tint: string) => {
      c.fillStyle = tint;
      c.beginPath();
      c.roundRect(x - paddleW / 2, y - paddleH / 2, paddleW, paddleH, paddleH / 2);
      c.fill();
    };
    paddle(s.ax, aiY, "#FF6B00");
    paddle(s.px, playerY, "#2C9FA2");

    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.arc(s.bx, s.by, ballR, 0, Math.PI * 2);
    c.fill();

    c.restore();
  });

  const aimAt = (clientX: number) => {
    const cv = canvas.current;
    if (!cv) return;
    world.current.tx = clientX - cv.getBoundingClientRect().left;
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvas}
        onPointerMove={(e) => aimAt(e.clientX)}
        onPointerDown={(e) => { e.preventDefault(); aimAt(e.clientX); }}
        className="h-full w-full touch-none"
        style={{ touchAction: "none" }}
      />

      {/* One pill, inset on the right so it never runs under the restart button
          on a narrow phone. */}
      <div className="pointer-events-none absolute left-3 right-16 top-3 flex justify-center">
        <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[14px] font-extrabold text-ink">
          <span className="text-orange">AI {scores.ai}</span>
          <span className="text-ink/45">ถึง {TARGET}</span>
          <span className="text-teal">คุณ {scores.you}</span>
        </span>
      </div>

      {serving && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span
            key={count}
            className="text-[74px] font-extrabold text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
            style={{ animation: "hh-count-in 500ms ease-out both" }}
          >
            {count}
          </span>
        </div>
      )}

      <p className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center text-[12px] font-bold text-white/55">
        ลากซ้าย-ขวาเพื่อรับลูก
      </p>
    </div>
  );
}
