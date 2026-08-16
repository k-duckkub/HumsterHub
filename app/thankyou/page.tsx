import type { Metadata } from "next";
import { ChallengeFlow } from "@/components/ChallengeFlow";

export const metadata: Metadata = {
  title: "ขอบคุณสำหรับการชำระเงิน | HamsterHub",
  description: "ผ่านมินิชาเลนจ์ 5 ด่าน เปิดกล่องรางวัล แล้วเช็คอินเข้ากิจกรรม",
};

export default function ThankYouPage() {
  return <ChallengeFlow />;
}
