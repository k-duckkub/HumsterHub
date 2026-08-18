export type RewardCategory = "PET" | "HAMSTERCOIN" | "EGG" | "BOX" | "NONE";
export type Rarity = "COMMON" | "RARE" | "EPIC" | "CURRENCY";

export interface Reward {
  id: string;
  name: string;
  category: RewardCategory;
  rarity: Rarity;
  /** Probability across a whole run, not within its category. */
  dropRate: number;
  /* ═══════ รูปรางวัลใส่ตรงนี้ ═══════
     วางไฟล์ใน public/assets/rewards/ แล้วใส่ path เช่น "/assets/rewards/pink-dino.webp"
     ปล่อยว่างไว้ได้ — UI จะโชว์ป้ายชื่อ + ระดับความหายากแทน ไม่พัง
     ใช้ "" ไม่ใช่ "file://" เพราะ file:// จะยิงคำขอที่พังแน่ ๆ ในเบราว์เซอร์ */
  imageUrl: string;
}

/** Category odds. These are the published rates and the source of truth. */
export const CATEGORY_RATES: Record<RewardCategory, number> = {
  PET: 0.10,
  HAMSTERCOIN: 0.05,
  EGG: 0.20,
  BOX: 0.10,
  // The remainder. Never fold it back into the four above — doing that is
  // exactly what breaks 1/10, 1/20 and 1/5.
  NONE: 0.55,
};

/** Odds inside a category, given that category was rolled. */
const EGG_SPLIT = { COMMON: 0.60, RARE: 0.30, EPIC: 0.10 } as const;
const BOX_SPLIT = { BRONZE: 0.70, SILVER: 0.30 } as const;

export const PETS: Reward[] = [
  { id: "pet_common_pink_dino", name: "Pink Dino Pet", category: "PET", rarity: "COMMON", dropRate: CATEGORY_RATES.PET / 6, imageUrl: "/assets/rewards/pet-pink-dino.png" },
  { id: "pet_common_cream_fluff", name: "Cream Fluff Pet", category: "PET", rarity: "COMMON", dropRate: CATEGORY_RATES.PET / 6, imageUrl: "/assets/rewards/pet-cream-fluff.png" },
  { id: "pet_common_white_dragon", name: "White Dragon Pet", category: "PET", rarity: "COMMON", dropRate: CATEGORY_RATES.PET / 6, imageUrl: "/assets/rewards/pet-white-dragon.png" },
  { id: "pet_common_mint_monster", name: "Mint Monster Pet", category: "PET", rarity: "COMMON", dropRate: CATEGORY_RATES.PET / 6, imageUrl: "/assets/rewards/pet-mint-monster.png" },
  { id: "pet_common_blue_blob", name: "Blue Blob Pet", category: "PET", rarity: "COMMON", dropRate: CATEGORY_RATES.PET / 6, imageUrl: "/assets/rewards/pet-blue-blob.png" },
  { id: "pet_common_long_cat", name: "Long Cat Pet", category: "PET", rarity: "COMMON", dropRate: CATEGORY_RATES.PET / 6, imageUrl: "/assets/rewards/pet-long-cat.png" },
];

export const HAMSTER_COIN: Reward = {
  id: "hamstercoin_basic", name: "Hamster Coin", category: "HAMSTERCOIN",
  rarity: "CURRENCY", dropRate: CATEGORY_RATES.HAMSTERCOIN, imageUrl: "/assets/rewards/hamster-coin.png",
};

export const EGGS: Reward[] = [
  { id: "egg_common", name: "Common Egg", category: "EGG", rarity: "COMMON", dropRate: CATEGORY_RATES.EGG * EGG_SPLIT.COMMON, imageUrl: "/assets/rewards/egg-common.png" },
  { id: "egg_rare", name: "Rare Egg", category: "EGG", rarity: "RARE", dropRate: CATEGORY_RATES.EGG * EGG_SPLIT.RARE, imageUrl: "/assets/rewards/egg-rare.png" },
  { id: "egg_epic", name: "Epic Egg", category: "EGG", rarity: "EPIC", dropRate: CATEGORY_RATES.EGG * EGG_SPLIT.EPIC, imageUrl: "/assets/rewards/egg-epic.png" },
];

export const BOXES: Reward[] = [
  { id: "box_common_bronze", name: "Bronze Box", category: "BOX", rarity: "RARE", dropRate: CATEGORY_RATES.BOX * BOX_SPLIT.BRONZE, imageUrl: "/assets/rewards/box-bronze.png" },
  { id: "box_rare_silver", name: "Silver Box", category: "BOX", rarity: "EPIC", dropRate: CATEGORY_RATES.BOX * BOX_SPLIT.SILVER, imageUrl: "/assets/rewards/box-silver.png" },
];

/* ═══════ รางวัลปลอบใจ ═══════ ยังไม่ได้กำหนดว่าได้อะไร */
export const NO_REWARD: Reward = {
  id: "none", name: "รอบนี้ยังไม่ได้ของสะสม", category: "NONE",
  rarity: "COMMON", dropRate: CATEGORY_RATES.NONE, imageUrl: "",
};

export const rewardCatalog: Reward[] = [...PETS, HAMSTER_COIN, ...EGGS, ...BOXES, NO_REWARD];

/** Coin drops roll again for how many, so the currency still has a payoff. */
const COIN_AMOUNTS: { amount: number; chance: number }[] = [
  { amount: 10, chance: 0.60 },
  { amount: 20, chance: 0.25 },
  { amount: 30, chance: 0.10 },
  { amount: 50, chance: 0.05 },
];

export type RollResult = {
  id: string;
  name: string;
  category: RewardCategory;
  rarity: Rarity;
  imageUrl: string;
  /** Only on HAMSTERCOIN. */
  amount?: number;
};

type Rng = () => number;

/** Walks a cumulative table; the last entry absorbs any float shortfall. */
function walk<T>(entries: T[], chanceOf: (e: T) => number, roll: number): T {
  let acc = 0;
  for (const entry of entries) {
    acc += chanceOf(entry);
    if (roll < acc) return entry;
  }
  return entries[entries.length - 1];
}

export function rollPet(rng: Rng = Math.random): Reward {
  return PETS[Math.min(PETS.length - 1, Math.floor(rng() * PETS.length))];
}

export function rollEgg(rng: Rng = Math.random): Reward {
  return walk(EGGS, (e) => EGG_SPLIT[e.rarity as keyof typeof EGG_SPLIT], rng());
}

export function rollBox(rng: Rng = Math.random): Reward {
  return walk(
    BOXES,
    (box) => box.id === "box_common_bronze" ? BOX_SPLIT.BRONZE : BOX_SPLIT.SILVER,
    rng(),
  );
}

export function rollCoinAmount(rng: Rng = Math.random): number {
  return walk(COIN_AMOUNTS, (c) => c.chance, rng()).amount;
}

/**
 * One reward per finished run.
 *
 * Two rolls, never one per item: testing every reward against its own rate
 * would let a single run hit several at once and would quietly inflate every
 * published number. Category first, then rarity inside it.
 *
 * `rng` is injectable so the distribution can be checked against the table
 * rather than eyeballed.
 */
export function rollReward(rng: Rng = Math.random, collectibleBoost = 0): RollResult {
  // Performance boxes add percentage points to the chance of receiving any
  // collectible. The boost comes only out of NONE, while the four collectible
  // categories keep their existing relative proportions.
  const safeBoost = Math.max(0, Math.min(CATEGORY_RATES.NONE, collectibleBoost));
  const baseCollectible = 1 - CATEGORY_RATES.NONE;
  const collectibleScale = (baseCollectible + safeBoost) / baseCollectible;
  const rates: Record<RewardCategory, number> = {
    PET: CATEGORY_RATES.PET * collectibleScale,
    HAMSTERCOIN: CATEGORY_RATES.HAMSTERCOIN * collectibleScale,
    EGG: CATEGORY_RATES.EGG * collectibleScale,
    BOX: CATEGORY_RATES.BOX * collectibleScale,
    NONE: CATEGORY_RATES.NONE - safeBoost,
  };
  const order: RewardCategory[] = ["PET", "HAMSTERCOIN", "EGG", "BOX", "NONE"];
  const category = walk(order, (c) => rates[c], rng());

  const reward =
    category === "PET" ? rollPet(rng)
      : category === "EGG" ? rollEgg(rng)
        : category === "BOX" ? rollBox(rng)
          : category === "HAMSTERCOIN" ? HAMSTER_COIN
            : NO_REWARD;

  return {
    id: reward.id,
    name: reward.name,
    category: reward.category,
    rarity: reward.rarity,
    imageUrl: reward.imageUrl,
    ...(category === "HAMSTERCOIN" ? { amount: rollCoinAmount(rng) } : {}),
  };
}

export const RARITY_COLOR: Record<Rarity, string> = {
  COMMON: "#8B95A5",
  RARE: "#2E7BFF",
  EPIC: "#9B5DE5",
  CURRENCY: "#F2A50E",
};

/** Reveal budgets per the brief: rarer means held longer, not shaped differently. */
export const REVEAL_MS: Record<Rarity, { anticipate: number; reveal: number }> = {
  COMMON: { anticipate: 120, reveal: 500 },
  RARE: { anticipate: 260, reveal: 720 },
  EPIC: { anticipate: 520, reveal: 1050 },
  CURRENCY: { anticipate: 120, reveal: 560 },
};
