export type IconName =
  | "pad" | "flask" | "bulb" | "rocket" | "puzzle" | "heart" | "bolt" | "brush" | "star"
  | "hand" | "ghost" | "shield" | "clock" | "coin" | "bowl" | "door" | "moon";

export type Option = {
  icon: IconName;
  text: string;
  /** Correct answers score 1; incorrect answers score 0. */
  score: number;
};

export type Question = {
  ask: string;
  opts: Option[];
};

/** Ten everyday-knowledge questions, three choices and one correct answer each.
 * Four are drawn per run; correct choices occupy different positions.
 * These assess only the facts asked, not a learner's overall ability. */
export const QUESTIONS: Question[] = [
  {
    ask: "ทุกคนต้องดื่มน้ำวันละ 8 แก้วเท่ากันไหม?",
    opts: [
      { icon: "bowl", text: "เท่ากันทุกคน", score: 0 },
      { icon: "heart", text: "ไม่เท่ากัน ขึ้นกับร่างกายและกิจกรรม", score: 1 },
      { icon: "hand", text: "ขึ้นอยู่กับความสูงอย่างเดียว", score: 0 },
    ],
  },
  {
    ask: "ของราคา 100 บาท ลด 50% แล้วลดอีก 50% จะเหลือเท่าไร?",
    opts: [
      { icon: "coin", text: "0 บาท", score: 0 },
      { icon: "coin", text: "50 บาท", score: 0 },
      { icon: "coin", text: "25 บาท", score: 1 },
    ],
  },
  {
    ask: "ข่าวที่มีคนแชร์เยอะ แปลว่าเป็นเรื่องจริงไหม?",
    opts: [
      { icon: "shield", text: "ยังสรุปไม่ได้ ต้องตรวจแหล่งที่มา", score: 1 },
      { icon: "heart", text: "จริง เพราะคนส่วนใหญ่เชื่อ", score: 0 },
      { icon: "brush", text: "จริง ถ้ามีภาพประกอบ", score: 0 },
    ],
  },
  {
    ask: "ขีด Wi-Fi เต็ม แปลว่าอินเทอร์เน็ตเร็วเสมอไหม?",
    opts: [
      { icon: "bolt", text: "เร็วที่สุดแน่นอน", score: 0 },
      { icon: "bulb", text: "ไม่เสมอ เพราะความแรงสัญญาณกับความเร็วเน็ตเป็นคนละเรื่อง", score: 1 },
      { icon: "pad", text: "เร็วเท่ากันทุกเครื่องที่เชื่อมต่อ", score: 0 },
    ],
  },
  {
    ask: "AI ตอบอย่างมั่นใจ แปลว่าคำตอบถูกแน่นอนไหม?",
    opts: [
      { icon: "bulb", text: "ถูก ถ้าคำตอบยาวและละเอียด", score: 0 },
      { icon: "heart", text: "ถูก ถ้าตอบเหมือนคนจริง", score: 0 },
      { icon: "shield", text: "ไม่แน่ ควรตรวจสอบข้อมูลสำคัญอีกครั้ง", score: 1 },
    ],
  },
  {
    ask: "เหล็ก 1 กิโลกรัม กับสำลี 1 กิโลกรัม อะไรมีมวลมากกว่า?",
    opts: [
      { icon: "shield", text: "เหล็ก", score: 0 },
      { icon: "puzzle", text: "เท่ากัน", score: 1 },
      { icon: "moon", text: "สำลี", score: 0 },
    ],
  },
  {
    ask: "โยนเหรียญที่ยุติธรรมออกหัวมาแล้ว 5 ครั้ง ครั้งต่อไปโอกาสออกก้อยเท่าไร?",
    opts: [
      { icon: "coin", text: "50% เหมือนเดิม", score: 1 },
      { icon: "star", text: "มากกว่า 50% เพราะหัวออกมาหลายครั้งแล้ว", score: 0 },
      { icon: "clock", text: "น้อยกว่า 50% เพราะกำลังออกหัวติดกัน", score: 0 },
    ],
  },
  {
    ask: "ใช้รหัสผ่านเดียวกันทุกเว็บ มีความเสี่ยงอะไร?",
    opts: [
      { icon: "shield", text: "ไม่มี ถ้ารหัสผ่านยาวมาก", score: 0 },
      { icon: "door", text: "ถ้าเว็บหนึ่งรั่ว บัญชีอื่นอาจถูกเข้าถึงด้วย", score: 1 },
      { icon: "clock", text: "เสี่ยงเฉพาะเว็บที่ไม่ได้ใช้บ่อย", score: 0 },
    ],
  },
  {
    ask: "น้ำ 500 มล. ราคา 20 บาท กับน้ำ 1 ลิตร ราคา 35 บาท แบบไหนถูกกว่าต่อปริมาตร?",
    opts: [
      { icon: "bowl", text: "ขวด 500 มล.", score: 0 },
      { icon: "coin", text: "ราคาเท่ากัน", score: 0 },
      { icon: "bowl", text: "ขวด 1 ลิตร", score: 1 },
    ],
  },
  {
    ask: "น้ำแข็ง 100 กรัมละลายหมด โดยไม่มีน้ำหกหรือระเหย จะได้น้ำกี่กรัม?",
    opts: [
      { icon: "flask", text: "100 กรัม", score: 1 },
      { icon: "flask", text: "น้อยกว่า 100 กรัม", score: 0 },
      { icon: "flask", text: "มากกว่า 100 กรัม", score: 0 },
    ],
  },
];

/** Fisher-Yates over a copy, preserving the question bank between sessions.
 * Call after mount so random draws cannot disagree with prerendered HTML. */
export function drawQuestions(count: number): Question[] {
  const pool = QUESTIONS.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
