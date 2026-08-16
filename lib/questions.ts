export type IconName =
  | "pad" | "flask" | "bulb" | "rocket" | "puzzle" | "heart" | "bolt" | "brush" | "star";

export type Option = {
  icon: IconName;
  text: string;
  /** Points this answer contributes. See PASS_MARK. */
  score: number;
};

export type Question = {
  ask: string;
  opts: Option[];
};

/* ═══════ คำถามชั่วคราว — เปลี่ยนเป็นของจริงได้เลย ═══════
   The questions are preferences with no right answer, so the scoring is what
   makes both chests reachable: every question carries one option worth no
   point, and 2 of 3 passes. Without that the iron chest would be dead code. */
export const QUESTIONS: Question[] = [
  {
    ask: "เวลาทำกิจกรรม น้องชอบแบบไหนที่สุด?",
    opts: [
      { icon: "pad", text: "ทำเกม", score: 1 },
      { icon: "flask", text: "ลองอะไรใหม่ ๆ", score: 1 },
      { icon: "bulb", text: "อยากรู้ว่าตัวเองเหมาะกับอะไร", score: 0 },
    ],
  },
  {
    ask: "ถ้ามีภารกิจให้เลือก น้องจะหยิบอะไรก่อน?",
    opts: [
      { icon: "rocket", text: "อันที่ดูท้าทายที่สุด", score: 1 },
      { icon: "puzzle", text: "อันที่ต้องคิดเยอะ ๆ", score: 1 },
      { icon: "heart", text: "อันที่ดูน่ารักที่สุด", score: 0 },
    ],
  },
  {
    ask: "วันนี้อยากได้ความสนุกสายไหน?",
    opts: [
      { icon: "bolt", text: "สายลุย ทำเลยไม่ต้องคิดนาน", score: 1 },
      { icon: "brush", text: "สายสร้างของสวย ๆ", score: 1 },
      { icon: "star", text: "ยังไม่แน่ใจ ขอลองดูก่อน", score: 0 },
    ],
  },
];

export const PASS_MARK = 2;
