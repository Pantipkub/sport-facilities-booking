import Alert from "@/components/Alert";
import Image from "next/image";
import TennisBallIcon from "@/components/TennisBallIcon";
import { api } from "@/libs/api";
import type { Facility } from "@/types";
import FacilityList from "./FacilityList";
import courtClubImage from "./court-club.webp";

export default async function Home() {
  const result = await api<Facility[]>("/facilities");
  const title = (
    <section className="cb-home-hero">
      <div className="cb-home-copy min-w-0">
        <h1 className="cb-home-title">
          จองสนามกีฬา<span>นัดเพื่อนลงสนาม</span>
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-[#eef0dd]">
          เลือกสนามที่สามย่าน บรรทัดทอง หรือสยาม แล้วจองเวลาเล่นได้ครั้งละไม่เกิน 2 ชั่วโมง
        </p>
        {result.ok && (
          <a href="#courts" className="cb-court-link mt-7 inline-flex min-h-12 items-center gap-3 rounded-full px-6 font-semibold">
            ค้นหาสนาม <TennisBallIcon className="size-5 shrink-0" />
          </a>
        )}
      </div>
      <div className="cb-hero-photo">
        <Image
          src={courtClubImage}
          alt=""
          fill
          preload
          sizes="(min-width: 1152px) 580px, (min-width: 768px) 52vw, 95vw"
          className="object-cover"
        />
        <div className="cb-hero-ball" aria-hidden="true"><TennisBallIcon className="size-10 sm:size-12" /></div>
      </div>
    </section>
  );

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 pt-5 pb-12 sm:px-6 sm:pt-8">
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
