import type { Metadata } from "next";
import { QuizFlow } from "@/components/QuizFlow";

export const metadata: Metadata = {
  title: "ขอบคุณสำหรับการชำระเงิน | HamsterHub",
  description: "ตอบคำถามสั้น ๆ เปิดกล่องรางวัล แล้วเช็คอินเข้ากิจกรรม",
};

export default function ThankYouPage() {
  return <QuizFlow />;
}
