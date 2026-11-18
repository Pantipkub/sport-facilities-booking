import Alert from "@/components/Alert";
import TennisBallIcon from "@/components/TennisBallIcon";
import { api } from "@/libs/api";
import type { Facility } from "@/types";
import FacilityList from "./FacilityList";

export default async function Home() {
  const result = await api<Facility[]>("/facilities");
  const title = (
    <section className="cb-home-hero grid items-center gap-8 md:grid-cols-[1.25fr_1fr]">
      <div className="cb-paper cb-ticket relative z-10 p-5 sm:p-8">
        <h1 className="cb-home-title cb-title font-semibold tracking-tight">จองสนามกีฬา</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed sm:text-base">
          เลือกสนามที่สามย่าน บรรทัดทอง หรือสยาม แล้วจองได้ครั้งละไม่เกิน 2 ชั่วโมง
        </p>
        {result.ok && (
          <a href="#courts" className="cb-primary cb-court-link mt-5 inline-flex min-h-11 items-center gap-2 px-5 text-sm font-medium">
            เลือกสนาม <TennisBallIcon className="size-5 shrink-0" />
          </a>
        )}
      </div>
      <div aria-hidden="true" className="cb-court-poster">
        <span className="cb-poster-star" />
        <span className="cb-poster-stamp" />
      </div>
    </section>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {title}
      {result.ok ? (
        <FacilityList facilities={result.data} />
      ) : (
        <>
          <div className="mt-6">
            <Alert variant="error">โหลดรายการสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</Alert>
          </div>
        </>
      )}
    </main>
  );
}
