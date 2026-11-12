import Link from "next/link";
import FacilityImage from "@/components/FacilityImage";
import SportBadge from "@/components/SportBadge";
import { baht } from "@/libs/format";
import type { Facility } from "@/types";

export default function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link
      href={`/facilities/${facility._id}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-sm"
    >
      <FacilityImage facility={facility} />
      <div className="p-5">
        <SportBadge sportType={facility.sportType} />
        <h3 className="mt-3 text-lg font-semibold">{facility.name}</h3>
        <p className="mt-0.5 text-sm text-stone-500">{facility.location}</p>
        <div className="mt-5 flex items-end justify-between border-t border-stone-100 pt-4">
          <span className="text-sm text-stone-500">ความจุ {facility.capacity} คน</span>
          <span className="text-sm text-stone-500">
            <span className="text-xl font-semibold text-stone-900">{baht(facility.hourlyRate)}</span> / ชม.
          </span>
        </div>
        <p className="mt-4 text-sm font-medium text-stone-900 group-hover:underline">ดูรายละเอียดและจอง →</p>
      </div>
    </Link>
  );
}
