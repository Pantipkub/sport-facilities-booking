import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { deleteFacility } from "@/app/admin/facilities/actions";
import BookingForm from "@/components/BookingForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import FacilityImage from "@/components/FacilityImage";
import SportBadge from "@/components/SportBadge";
import { api } from "@/libs/api";
import { baht } from "@/libs/format";
import { sportOf } from "@/libs/sports";
import type { Facility } from "@/types";

const BTN = "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium";
const PRIMARY = `${BTN} bg-stone-900 text-white hover:bg-stone-700`;
const SECONDARY = `${BTN} border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900`;

export default async function FacilityPage({ params }: PageProps<"/facilities/[id]">) {
  const { id } = await params;
  const [result, session] = await Promise.all([api<Facility>(`/facilities/${id}`), getServerSession(authOptions)]);
  if (!result.ok) {
    if (result.status === 0) throw new Error(result.error); // backend down, not a missing facility
    notFound(); // 404 for deleted facilities, 500 (bad ObjectId) for made-up ids
  }
  const f = result.data;
  const role = session?.user.role;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1fr_380px]">
      <div>
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
          ← สนามทั้งหมด
        </Link>
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <FacilityImage facility={f} className="aspect-[21/9]" />
          <div className="p-8">
            <SportBadge sportType={f.sportType} />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{f.name}</h1>
            <p className="mt-1 text-stone-500">{f.location}</p>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-100 pt-6">
              <div>
                <dt className="text-sm text-stone-500">ประเภทกีฬา</dt>
                <dd className="mt-1 font-medium">{sportOf(f.sportType).label}</dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">ความจุ</dt>
                <dd className="mt-1 font-medium">{f.capacity} คน</dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">ราคา</dt>
                <dd className="mt-1 font-medium">{baht(f.hourlyRate)} / ชม.</dd>
              </div>
            </dl>
            <div className="mt-8 rounded-xl bg-stone-50 p-5">
              <h2 className="text-sm font-semibold">เงื่อนไขการจอง</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                <li>จองได้ตั้งแต่วันนี้เป็นต้นไป เลือกเวลาเริ่มและเวลาสิ้นสุดได้ทุก 30 นาที</li>
                <li>จองได้ครั้งละไม่เกิน 2 ชั่วโมง และต้องจบภายในวันเดียวกัน</li>
                <li>ช่วงเวลาที่มีคนจองแล้ว หรือซ้อนกับการจองอื่นของคุณ จะจองไม่ได้</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:pt-9">
        {role === "member" ? (
          <BookingForm facility={f} />
        ) : role === "admin" ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold">จัดการสนามนี้</h2>
            <p className="mt-1 text-sm text-stone-500">ผู้ดูแลระบบแก้ไขหรือลบสนามได้ แต่ไม่สามารถจองสนามได้</p>
            <div className="mt-5 grid gap-2">
              <Link href={`/admin/facilities/${f._id}/edit`} className={PRIMARY}>
                แก้ไขข้อมูลสนาม
              </Link>
              <ConfirmDialog
                title={`ลบสนาม ${f.name}?`}
                message="สนามนี้จะไม่แสดงในรายการและไม่สามารถจองได้อีก"
                action={deleteFacility.bind(null, f._id)}
                confirmLabel="ลบสนาม"
                trigger="ลบสนาม"
                triggerClassName={`${BTN} border border-red-200 bg-white text-red-600 hover:bg-red-50`}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold">จองสนามนี้</h2>
            <p className="mt-1 text-sm text-stone-500">เข้าสู่ระบบก่อนเพื่อเลือกวันและเวลาที่ต้องการ</p>
            <div className="mt-5 grid gap-2">
              <Link href="/login" className={PRIMARY}>
                เข้าสู่ระบบเพื่อจอง
              </Link>
              <Link href="/register" className={SECONDARY}>
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
