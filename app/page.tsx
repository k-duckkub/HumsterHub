import Link from "next/link";

/**
 * The summary page is still the vanilla build in legacy/. This is a stub so
 * the app has a root route; porting it is the next slice of work.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-[-0.02em]">HamsterHub</h1>
      <p className="text-slate-body">
        หน้าสรุปการสมัครยังไม่ได้ย้ายมา Next.js — ตอนนี้พอร์ตหน้า Thank You ไว้ก่อน
      </p>
      <Link
        href="/thankyou"
        className="inline-flex h-[54px] items-center rounded-[15px] bg-orange px-7 text-[17px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(255,107,0,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
      >
        ไปหน้า Thank You
      </Link>
    </main>
  );
}
