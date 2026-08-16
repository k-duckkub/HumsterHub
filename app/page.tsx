import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CopyProvider, CopyButton } from "@/components/CopyToast";

export const metadata: Metadata = {
  title: "สรุปข้อมูลการสมัคร | HamsterHub",
  description: "สรุปการสมัคร SciGameLab Camp พร้อมยอดชำระและช่องทางการโอน",
};

const CARD = "rounded-[22px] border border-[#e6e6e6] bg-white shadow-[0_8px_24px_rgba(10,26,47,0.08)]";
const LABEL = "text-sm text-slate-body";

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[18px] w-[18px]">
    <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function SummaryPage() {
  return (
    <CopyProvider>
      <main className="mx-auto max-w-[1200px] px-8 pb-20 pt-12 max-md:px-4 max-md:pb-14 max-md:pt-7">
        <header>
          <p className="mb-1.5 text-[19px] font-bold uppercase tracking-[0.06em] text-orange max-md:text-base">
            Registration Summary
          </p>
          <h1 className="mb-[30px] text-[52px] font-extrabold leading-[1.1] tracking-[-0.01em] max-md:mb-[22px] max-md:text-[38px]">
            สรุปข้อมูลการสมัคร
          </h1>
        </header>

        {/* CARD 1 · CAMP */}
        <section className={`${CARD} grid grid-cols-[65fr_35fr] items-center gap-8 p-[18px] max-md:grid-cols-1 max-md:gap-[22px] max-md:p-4`}>
          <Image
            src="/assets/banner-scigamelab.webp"
            width={1425}
            height={762}
            priority
            className="w-full rounded-[18px]"
            alt="แบนเนอร์ค่าย SciGameLab Camp — เปลี่ยนวิทย์ที่เคยยากให้กลายเป็นเกมสุดเจ๋ง"
          />
          <div>
            <h2 className="mb-[26px] text-[34px] font-extrabold tracking-[-0.01em] max-md:mb-[18px] max-md:text-[28px]">
              SciGameLab Camp
            </h2>
            <ul className="flex list-none flex-col gap-6 max-md:gap-4">
              <li className="flex items-center gap-3.5 text-[23px] max-md:gap-3 max-md:text-[19px]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[30px] w-[30px] shrink-0 text-orange max-md:h-[26px] max-md:w-[26px]">
                  <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                เรียนวันที่ 14–16 ส.ค.
              </li>
              <li className="flex items-center gap-3.5 text-[23px] max-md:gap-3 max-md:text-[19px]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[30px] w-[30px] shrink-0 text-orange max-md:h-[26px] max-md:w-[26px]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 7v5.4l3.4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                เวลา 19.00 – 21.00 น.
              </li>
            </ul>
          </div>
        </section>

        {/* CARD 2 · TOTAL — at phone widths the price cannot share the row, so
            it drops to its own line rather than shrinking the type. */}
        <section className={`${CARD} mt-5 flex min-h-[140px] items-center gap-[26px] px-[34px] py-[26px] max-md:grid max-md:min-h-0 max-md:grid-cols-[auto_minmax(0,1fr)] max-md:gap-x-[18px] max-md:gap-y-3.5 max-md:p-[22px]`}>
          <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-[20px] bg-soft-orange max-md:h-[68px] max-md:w-[68px] max-md:rounded-2xl">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[46px] w-[46px] text-orange max-md:h-[34px] max-md:w-[34px]">
              <path d="M5 3h14v18l-2.3-1.6-2.35 1.6L12 19.4 9.65 21 7.3 19.4 5 21V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[28px] font-bold tracking-[-0.01em] max-md:text-[23px]">ยอดชำระทั้งหมด</p>
            <p className="mt-0.5 text-[18px] text-slate-body max-md:text-base">โปรดแจ้งชำระเงินภายใน 24 ชั่วโมง</p>
          </div>
          <p className="whitespace-nowrap text-[56px] font-extrabold leading-none tracking-[-0.01em] text-orange max-md:col-span-full max-md:text-right max-md:text-[42px]">
            ฿190
          </p>
        </section>

        {/* CARD 3 · NEXT STEP — below 1190px the card cannot hold
            "steps | QR + account" side by side without the payment column
            growing tall again and leaving a hole under the LINE button. */}
        <section className={`${CARD} mt-5 grid grid-cols-[47fr_53fr] gap-9 p-[34px] max-[1190px]:grid-cols-1 max-md:gap-[30px] max-md:p-[22px]`}>
          <div>
            <p className="mb-1.5 text-[19px] font-bold uppercase tracking-[0.06em] text-orange max-md:text-base">
              Next Step
            </p>
            <div className="mb-6 flex items-center gap-5 max-md:mb-[18px] max-md:gap-4">
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[14px] bg-orange text-[32px] font-extrabold text-white max-md:h-[50px] max-md:w-[50px] max-md:rounded-xl max-md:text-[27px]">
                1
              </span>
              <h2 className="text-[34px] font-extrabold tracking-[-0.01em] max-md:text-[27px]">
                แจ้งชำระเงินและเข้าเรียน
              </h2>
            </div>

            <p className="mb-5 text-[22px] max-md:text-[19px]">
              ให้ add Line:{" "}
              <CopyButton value="@smart-school" className="cursor-pointer border-0 bg-transparent p-0 text-orange hover:underline hover:underline-offset-[3px]">
                @smart-school
              </CopyButton>
            </p>

            <p className="mb-[18px] flex min-h-[58px] items-center gap-3.5 rounded-[14px] border-[1.5px] border-hairline bg-white px-5 py-2.5 text-[18px] max-md:text-base">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6 shrink-0 text-orange">
                <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              แจ้งและรับข่าวสารทาง LINE
            </p>

            {/* Official LINE artwork is 2000x667 with the pill inset inside
                transparent padding at x 155–1844, y 156–499. The box takes the
                pill's own 1690x344 ratio and the image is scaled and offset so
                only the pill shows. */}
            <a
              href="https://line.me/R/ti/p/@smart-school"
              target="_blank"
              rel="noopener"
              aria-label="เพิ่มเพื่อนในไลน์ @smart-school"
              className="relative block w-[288px] max-w-full overflow-hidden rounded-full shadow-[0_8px_20px_rgba(6,199,85,0.2)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(6,199,85,0.28)] max-md:w-[240px]"
              style={{ aspectRatio: "1690 / 344" }}
            >
              <img
                src="/assets/line-add-friend.webp"
                alt=""
                className="absolute max-w-none"
                style={{ width: "118.343%", left: "-9.172%", top: "-45.349%" }}
              />
            </a>
          </div>

          <div className="flex flex-col items-center border-l border-hairline pl-10 text-center max-[1190px]:border-l-0 max-[1190px]:pl-0">
            {/* QR and account sit side by side rather than stacked: stacking
                made this column 218px taller than the left one. */}
            <div className="flex w-full flex-wrap items-center justify-center gap-7 max-[1190px]:mx-auto max-[1190px]:max-w-[540px] max-md:flex-col max-md:gap-[22px]">
              <div className="shrink-0">
                {/* Caption lives inside the frame so the orange border reads as
                    one card rather than a box with a floating label under it. */}
                <div className="rounded-[20px] border-[6px] border-orange bg-white px-3 pb-2.5 pt-3 text-center">
                  <img src="/assets/qr-payment.webp" width={1254} height={1254} alt="QR code สำหรับชำระเงิน" className="w-[224px] max-md:w-[200px]" />
                  <p className="mt-2 text-base leading-[1.45] text-slate-body">สแกน QR เพื่อชำระเงิน</p>
                </div>
              </div>

              {/* ═══════ ข้อมูลบัญชีธนาคาร ═══════ */}
              <dl className="flex flex-[1_1_210px] flex-col gap-[18px] pt-1 text-left max-md:w-full max-md:flex-none max-md:gap-4 max-md:border-t max-md:border-hairline max-md:pt-[22px]">
                <div className="flex flex-col gap-1.5">
                  <dt className={LABEL}>ธนาคาร</dt>
                  <dd>
                    {/* The lockup already reads "ธนาคารกรุงไทย", so the name is
                        not repeated as text — it lives in the alt instead. */}
                    <img src="/assets/krungthai-logo.webp" width={638} height={140} alt="ธนาคารกรุงไทย จำกัด (มหาชน)" className="w-[168px]" />
                  </dd>
                </div>
                <div className="flex flex-col gap-1.5">
                  <dt className={LABEL}>เลขบัญชี</dt>
                  <dd>
                    {/* Copies digits only: banking apps reject the dashes, so
                        copying the pretty form would just make people retype. */}
                    <CopyButton
                      value="0151565031"
                      className="inline-flex cursor-pointer items-center gap-2 rounded border-0 bg-transparent p-0 text-base font-bold text-ink hover:text-orange"
                    >
                      015-1-56503-1
                      <CopyIcon />
                    </CopyButton>
                  </dd>
                </div>
                <div className="flex flex-col gap-1.5">
                  <dt className={LABEL}>ชื่อบัญชี</dt>
                  <dd className="text-base font-bold leading-[1.45] text-ink text-pretty">
                    บริษัท เอ็กซ์บิส (ประเทศไทย) จำกัด
                  </dd>
                </div>
              </dl>
              {/* ═══════ จบข้อมูลบัญชีธนาคาร ═══════ */}
            </div>
          </div>
        </section>

        {/* ═══════ TEMPORARY TEST BUTTON — DELETE BEFORE LAUNCH ═══════
            จำลองว่าจ่ายเงินเสร็จแล้ว เพื่อทดสอบหน้า Thank You
            ของจริงสแกน QR แล้วเว็บไม่รู้ว่าจ่ายเงินหรือยัง เด้งเองไม่ได้ */}
        <Link
          href="/thankyou"
          className="mx-auto mt-10 block w-fit rounded-lg border border-dashed border-[#b9b9c2] px-4 py-2.5 text-[15px] text-[#6c6c75] no-underline transition-colors hover:border-[#8d8d96] hover:text-[#3c3c42]"
        >
          🧪 TEST · ข้ามไปหน้า Thank You (จำลองว่าจ่ายเงินแล้ว)
        </Link>
        {/* ═══════ END TEMPORARY TEST BUTTON ═══════ */}
      </main>
    </CopyProvider>
  );
}
