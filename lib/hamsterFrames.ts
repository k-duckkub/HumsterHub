/**
 * The shower sheet and how its frames map onto the fail count.
 *
 * Everything the sprite renderer needs is in this one file, so dropping the
 * artwork in is a config edit rather than a component rewrite.
 */

/* ═══════ พอวางไฟล์ sheet ใน public/assets/ แล้ว เปลี่ยนเป็น true ═══════
   Left false so nothing requests an asset that is not there yet — a 404 per
   page load is worse than the fallback it would be papering over. The SVG
   hamster in HamsterShower.tsx runs until this flips. */
export const USE_SPRITE = false;

export const SHEET = {
  src: "/assets/hamster-shower.webp",
  cols: 4,
  rows: 2,
  /* ═══════ ยืนยันค่านี้ตอนได้ไฟล์จริง ═══════
     Width ÷ height of a single cell after cropping. Wrong here and every frame
     is stretched, so it is measured off the file rather than assumed. */
  cellAspect: 1,
};

/** Frame index (0-based) to show at each fail count, 0 through 5. */
export const FRAME_FOR_FAIL = [0, 1, 2, 3, 4, 5];

/**
 * Frames 7 and 8 are the aftermath, not another fail state: the water stops,
 * she drips, then she shivers. They play out on a timer once the fifth miss
 * has landed and the last one holds.
 */
export const AFTERMATH: { frame: number; at: number }[] = [
  { frame: 6, at: 900 },
  { frame: 7, at: 1800 },
];

export const SHOWER_LABEL = [
  "แฮมสเตอร์ยืนยิ้มมั่นใจ ยังไม่มีอะไรเกิดขึ้น",
  "มีท่อน้ำเลื่อนลงมาจากด้านบน แฮมสเตอร์เริ่มเหลียวมอง",
  "ฝักบัวโผล่มาแล้ว แฮมสเตอร์เริ่มกังวล",
  "น้ำเริ่มหยดลงมา แฮมสเตอร์ขยับหนี",
  "น้ำไหลลงมาแล้ว แฮมสเตอร์ตกใจ",
  "แฮมสเตอร์เปียกทั้งตัวและสั่นเล็กน้อย",
];

/** Position of one cell within the sheet, as a CSS background-position pair. */
export function cellPosition(frame: number): string {
  const col = frame % SHEET.cols;
  const row = Math.floor(frame / SHEET.cols);
  const x = SHEET.cols > 1 ? (col / (SHEET.cols - 1)) * 100 : 0;
  const y = SHEET.rows > 1 ? (row / (SHEET.rows - 1)) * 100 : 0;
  return `${x}% ${y}%`;
}
