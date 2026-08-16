export type IconName =
  | "pad" | "flask" | "bulb" | "rocket" | "puzzle" | "heart" | "bolt" | "brush" | "star"
  | "hand" | "ghost" | "shield" | "clock" | "coin" | "bowl" | "door" | "moon";

export type Option = {
  icon: IconName;
  text: string;
  /** Above zero keeps the hamster dry. See the note on SAFE below. */
  score: number;
};

export type Question = {
  ask: string;
  opts: Option[];
};

/**
 * Twenty questions, three answers each, drawn fresh every session.
 *
 * None of them has a factually right answer, so "safe" is the one that keeps
 * the hamster out of trouble — the cautious, the kind, or the one the joke is
 * built around. Something has to score, or the iron box becomes unreachable:
 * with only the mini games able to miss, a run tops out at two fails and the
 * bottom tier is dead code.
 *
 * The safe answer is not always first. A player who learns "always pick A"
 * would be playing the layout instead of the question.
 */
export const QUESTIONS: Question[] = [
  {
    ask: "ถ้าเจอปุ่มแดงเขียนว่า “ห้ามกด” คุณจะ…",
    opts: [
      { icon: "hand", text: "ไม่กด", score: 1 },
      { icon: "bolt", text: "กดทันที", score: 0 },
      { icon: "heart", text: "ให้เพื่อนกดก่อน", score: 0 },
    ],
  },
  {
    ask: "ถ้าแฮมสเตอร์ใน Hamster Hub ขโมยขนมคุณไป?",
    opts: [
      { icon: "bolt", text: "แย่งคืน", score: 0 },
      { icon: "heart", text: "แบ่งให้ครึ่งนึง", score: 1 },
      { icon: "star", text: "ยกให้ทั้งหมด", score: 0 },
    ],
  },
  {
    ask: "ถ้าเลือกพลังได้ 1 อย่าง?",
    opts: [
      { icon: "clock", text: "หยุดเวลา", score: 1 },
      { icon: "ghost", text: "หายตัว", score: 0 },
      { icon: "rocket", text: "บินได้", score: 0 },
    ],
  },
  {
    ask: "ถ้าเปิดกล่องปริศนาแล้วมีเสียงกุกกัก?",
    opts: [
      { icon: "bolt", text: "เปิดทันที", score: 0 },
      { icon: "puzzle", text: "เขย่าก่อน", score: 0 },
      { icon: "shield", text: "ถอยก่อนหนึ่งก้าว", score: 1 },
    ],
  },
  {
    ask: "ถ้าได้ Hamster Coin 1,000 Coin ฟรี?",
    opts: [
      { icon: "bolt", text: "ใช้ทันที", score: 0 },
      { icon: "coin", text: "เก็บไว้", score: 1 },
      { icon: "heart", text: "เอาไปแจกเพื่อน", score: 0 },
    ],
  },
  {
    ask: "ถ้าตื่นมาแล้วกลายเป็นแฮมสเตอร์?",
    opts: [
      { icon: "bowl", text: "หาของกิน", score: 0 },
      { icon: "door", text: "สำรวจบ้าน", score: 1 },
      { icon: "moon", text: "นอนต่อ", score: 0 },
    ],
  },
  {
    ask: "ถ้าต้องติดเกาะกับของ 1 ชิ้น?",
    opts: [
      { icon: "bulb", text: "โทรศัพท์", score: 0 },
      { icon: "shield", text: "มีด", score: 1 },
      { icon: "moon", text: "หมอน", score: 0 },
    ],
  },
  {
    ask: "ถ้า Hamster Hub มีบอสลับ คุณคิดว่าคืออะไร?",
    opts: [
      { icon: "clock", text: "Deadline", score: 0 },
      { icon: "bolt", text: "Wi-Fi", score: 0 },
      { icon: "ghost", text: "งานที่บอกว่า “แป๊บเดียวเสร็จ”", score: 1 },
    ],
  },
  {
    ask: "ถ้าเพื่อนบอกว่า “อย่าหันหลังไปนะ”",
    opts: [
      { icon: "shield", text: "ไม่หัน", score: 1 },
      { icon: "ghost", text: "หันทันที", score: 0 },
      { icon: "rocket", text: "วิ่งก่อน", score: 0 },
    ],
  },
  {
    ask: "ถ้าต้องกินเมนูเดียว 7 วัน?",
    opts: [
      { icon: "bowl", text: "ข้าวผัด", score: 1 },
      { icon: "star", text: "พิซซ่า", score: 0 },
      { icon: "flask", text: "มาม่า", score: 0 },
    ],
  },
  {
    ask: "ถ้า Hub แจก Quest ตอนเที่ยงคืน?",
    opts: [
      { icon: "bolt", text: "รับเลย", score: 1 },
      { icon: "clock", text: "พรุ่งนี้ค่อยทำ", score: 0 },
      { icon: "ghost", text: "แกล้งออฟไลน์", score: 0 },
    ],
  },
  {
    ask: "ถ้ามีประตู 3 บาน คุณจะเลือก…",
    opts: [
      { icon: "bulb", text: "บานที่มีแสง", score: 1 },
      { icon: "heart", text: "บานที่มีเสียงหัวเราะ", score: 0 },
      { icon: "door", text: "บานที่เงียบสนิท", score: 0 },
    ],
  },
  {
    ask: "ถ้าได้ Clone ตัวเอง 1 คน?",
    opts: [
      { icon: "bulb", text: "ให้ไปเรียนแทน", score: 0 },
      { icon: "brush", text: "ให้ทำงานแทน", score: 1 },
      { icon: "pad", text: "ให้เล่นเกมเป็นเพื่อน", score: 0 },
    ],
  },
  {
    ask: "ถ้าแฮมสเตอร์พูดได้ 1 ประโยค คุณคิดว่ามันจะพูดว่า…",
    opts: [
      { icon: "star", text: "“ทำเควสยัง”", score: 1 },
      { icon: "bowl", text: "“มีอะไรกินไหม”", score: 0 },
      { icon: "moon", text: "“วันนี้พักได้”", score: 0 },
    ],
  },
  {
    ask: "ถ้าต้องเลือกสัตว์มาเป็นบอดี้การ์ด?",
    opts: [
      { icon: "shield", text: "หมี", score: 0 },
      { icon: "bolt", text: "เสือ", score: 0 },
      { icon: "ghost", text: "ห่าน", score: 1 },
    ],
  },
  {
    ask: "ถ้าได้ย้อนเวลา 10 นาที?",
    opts: [
      { icon: "clock", text: "แก้สิ่งที่พลาด", score: 1 },
      { icon: "ghost", text: "แกล้งเพื่อน", score: 0 },
      { icon: "coin", text: "เก็บไว้ใช้ทีหลัง", score: 0 },
    ],
  },
  {
    ask: "ถ้า Hamster Hub มีห้องลับ คุณอยากให้ข้างในมี…",
    opts: [
      { icon: "coin", text: "กล่องสมบัติ", score: 1 },
      { icon: "heart", text: "แฮมสเตอร์ 100 ตัว", score: 0 },
      { icon: "moon", text: "ห้องนอนอย่างดี", score: 0 },
    ],
  },
  {
    ask: "ถ้าไฟดับตอนเที่ยงคืน?",
    opts: [
      { icon: "bulb", text: "เปิดแฟลช", score: 1 },
      { icon: "moon", text: "นอนต่อ", score: 0 },
      { icon: "heart", text: "โทรหาเพื่อน", score: 0 },
    ],
  },
  {
    ask: "ถ้าชนะลอตเตอรี่ 10 ล้าน สิ่งแรกที่จะทำคือ?",
    opts: [
      { icon: "star", text: "ซื้อของที่อยากได้", score: 0 },
      { icon: "coin", text: "เก็บเงิน", score: 1 },
      { icon: "heart", text: "เลี้ยงเพื่อน", score: 0 },
    ],
  },
  {
    ask: "ถ้าสุดท้ายต้องเลือก 1 อย่าง?",
    opts: [
      { icon: "star", text: "กล่องเพชร", score: 1 },
      { icon: "coin", text: "Hamster Coin 500", score: 0 },
      { icon: "moon", text: "วันหยุดเพิ่ม 1 วัน", score: 0 },
    ],
  },
];

/**
 * Fisher-Yates over a copy, so the exported list stays in its authored order
 * and two sessions in the same tab cannot influence each other.
 *
 * Must be called after mount, never during render: this page is statically
 * prerendered, and a draw in the render pass bakes one set into the HTML that
 * the client then disagrees with at hydration.
 */
export function drawQuestions(count: number): Question[] {
  const pool = QUESTIONS.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
