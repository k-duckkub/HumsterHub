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
  /** `slot` indexes the questions drawn for this session, not the whole pool. */
  | { kind: "question"; slot: number }
  | { kind: "game"; game: GameId };

export const QUESTIONS_PER_RUN = 4;
export const GAMES_PER_RUN = 1;
export const TOTAL_STAGES = QUESTIONS_PER_RUN + GAMES_PER_RUN;

/** Two questions, one game, then two questions. The run still ends on a calm
 *  question beat rather than immediately after the mini-game. */
const GAME_SLOTS = [2];

export function buildStages(games: readonly GameId[]): Stage[] {
  const stages: Stage[] = [];
  let question = 0;
  let game = 0;

  for (let i = 0; i < TOTAL_STAGES; i++) {
    if (GAME_SLOTS.includes(i) && game < games.length) {
      stages.push({ kind: "game", game: games[game++] });
    } else {
      stages.push({ kind: "question", slot: question++ });
    }
  }
  return stages;
}

export type Tier = "diamond" | "silver" | "wood";

export function tierForFails(fails: number): Tier {
  if (fails === 0) return "diamond";
  if (fails <= 2) return "silver";
  return "wood";
}

/** Extra percentage points of collectible chance earned by performance. */
export const TIER_REWARD_BOOST: Record<Tier, number> = {
  wood: 0,
  silver: 0.05,
  diamond: 0.07,
};

export const TIER_COPY: Record<Tier, { head: string; sub: string; boxName: string; boost: string }> = {
  diamond: {
    head: "Perfect!",
    sub: "ผ่านครบทั้ง 5 ด่านโดยไม่พลาดเลย",
    boxName: "กล่องเพชร",
    boost: "เพิ่มโอกาสได้ของดี +7%",
  },
  silver: {
    head: "เกือบสมบูรณ์แบบ!",
    sub: "พลาดไปนิดเดียว แฮมยังแห้งอยู่พอสมควร",
    boxName: "กล่องเงิน",
    boost: "เพิ่มโอกาสได้ของดี +5%",
  },
  wood: {
    head: "ยังมีรางวัลให้เปิดนะ!",
    sub: "แฮมเปียกไปหน่อย แต่ของข้างในยังอยู่ครบ",
    boxName: "กล่องไม้",
    boost: "โอกาสได้ของดี +0%",
  },
};
