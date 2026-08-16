export type GameId = "xo" | "hoop" | "puzzle" | "pong";

export const ALL_GAMES: readonly GameId[] = ["xo", "hoop", "puzzle", "pong"];

export const GAME_META: Record<GameId, { title: string; tagline: string; how: string }> = {
  xo: {
    title: "XO CHALLENGE",
    tagline: "เรียง X ให้ครบสามก่อน AI!",
    how: "แตะช่องว่างเพื่อวาง ✕",
  },
  hoop: {
    title: "HOOP DROP",
    tagline: "ลอดให้ได้ 2 จาก 3 ห่วง!",
    how: "แตะเพื่อกระโดด",
  },
  puzzle: {
    title: "SLIDING PUZZLE",
    tagline: "จัดเรียงภาพให้ครบก่อนหมดเวลา!",
    how: "แตะแผ่นที่ติดกับช่องว่าง",
  },
  pong: {
    title: "PONG CHALLENGE",
    tagline: "ทำให้ได้ 3 แต้มก่อน AI!",
    how: "ลาก / เลื่อนเมาส์ ซ้าย-ขวา",
  },
};

/** Fisher-Yates. Copies rather than sorting in place so callers can pass a
 *  frozen constant like ALL_GAMES without it mutating under them. */
export function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type Stage =
  | { kind: "question"; questionIndex: number }
  | { kind: "game"; game: GameId };

/** Question, game, question, game, question — the two games drawn without
 *  replacement so one session never repeats a game. */
export function buildStages(games: readonly GameId[]): Stage[] {
  return [
    { kind: "question", questionIndex: 0 },
    { kind: "game", game: games[0] },
    { kind: "question", questionIndex: 1 },
    { kind: "game", game: games[1] },
    { kind: "question", questionIndex: 2 },
  ];
}

export const TOTAL_STAGES = 5;

export type Tier = "diamond" | "silver" | "iron";

export function tierForFails(fails: number): Tier {
  if (fails === 0) return "diamond";
  if (fails <= 2) return "silver";
  return "iron";
}

export const TIER_COPY: Record<Tier, { head: string; sub: string; boxName: string }> = {
  diamond: {
    head: "Perfect!",
    sub: "ผ่านครบทั้ง 5 ด่านโดยไม่พลาดเลย",
    boxName: "กล่องเพชร",
  },
  silver: {
    head: "เกือบสมบูรณ์แบบ!",
    sub: "พลาดไปนิดเดียว แฮมยังแห้งอยู่พอสมควร",
    boxName: "กล่องเงิน",
  },
  iron: {
    head: "ยังมีรางวัลให้เปิดนะ!",
    sub: "แฮมเปียกไปหน่อย แต่ของข้างในยังอยู่ครบ",
    boxName: "กล่องเหล็ก",
  },
};
