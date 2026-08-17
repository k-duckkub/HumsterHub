import type { Tier } from "./games";

export type Reward = {
  id: string;
  /** Shown under the artwork. */
  name: string;
  /** Path under public/. Square artwork on transparency reads best. */
  image: string;
  /**
   * Lowest box that contains it. Omit and every box does.
   *
   * Ordered worst to best, so "iron" means everyone gets it and "diamond"
   * means only a perfect run does.
   */
  minTier?: Tier;
};

/* ═══════ รางวัลใส่ตรงนี้ ═══════
   วางไฟล์รูปใน public/assets/rewards/ แล้วเพิ่มรายการข้างล่าง เช่น
     { id: "dino", name: "ไดโนชมพู", image: "/assets/rewards/dino.webp" }
   ถ้าอยากให้ออกเฉพาะกล่องดี ๆ ใส่ minTier: "silver" หรือ "diamond"

   Empty for now, and the shelf renders nothing while it is — a prize screen
   with an empty grid on it looks broken in a way that no prize screen does. */
export const REWARDS: Reward[] = [];

const RANK: Record<Tier, number> = { iron: 0, silver: 1, diamond: 2 };

/** What a given box actually contains. */
export function rewardsFor(tier: Tier): Reward[] {
  return REWARDS.filter((r) => !r.minTier || RANK[tier] >= RANK[r.minTier]);
}
