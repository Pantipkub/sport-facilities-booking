import Link from "next/link";
import FacilityImage from "@/components/FacilityImage";
import SportBadge from "@/components/SportBadge";
import TennisBallIcon from "@/components/TennisBallIcon";
import { baht } from "@/libs/format";
import type { Facility } from "@/types";

export default function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link
      href={`/facilities/${facility._id}`}
      className="cb-paper cb-facility-card group flex flex-col overflow-hidden hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand)]"
    >
      <FacilityImage facility={facility} />
      <div className="flex flex-1 flex-col p-5">
        <div>
          <SportBadge sportType={facility.sportType} />
          <h3 className="mt-3 text-lg font-semibold">{facility.name}</h3>
          <p className="mt-0.5 text-sm text-stone-600">{facility.location}</p>
        </div>
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[var(--line)] pt-4">
            <span className="text-sm text-stone-600">ความจุ {facility.capacity} คน</span>
            <span className="text-sm text-stone-600">
              <span className="cb-title text-xl font-semibold">{baht(facility.hourlyRate)}</span> / ชม.
            </span>
          </div>
          <p className="cb-title mt-4 flex items-center justify-between gap-2 text-sm font-medium">
            ดูรายละเอียดและจอง
            <span className="cb-card-ball grid size-8 shrink-0 place-items-center rounded-full">
              <TennisBallIcon className="size-5" />
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
