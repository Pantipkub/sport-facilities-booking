import Alert from "@/components/Alert";
import FacilityCard from "@/components/FacilityCard";
import { api } from "@/libs/api";
import type { Facility } from "@/types";

export default async function Home() {
  const result = await api<Facility[]>("/facilities");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">จองสนามกีฬา</h1>
      <p className="mt-1 text-stone-500">
        สนามทั้งหมดของ CourtBook 3 สาขา (สามย่าน, บรรทัดทอง, สยาม) จองได้ทันที ครั้งละไม่เกิน 2 ชั่วโมง
      </p>
      {result.ok ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((f) => (
            <FacilityCard key={f._id} facility={f} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <Alert variant="error">โหลดรายการสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</Alert>
        </div>
      )}
    </main>
  );
}
