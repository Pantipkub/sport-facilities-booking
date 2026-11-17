"use client";

import { useRef, useState } from "react";
import FacilityCard from "@/components/FacilityCard";
import SportFilter from "@/components/SportFilter";
import type { Facility } from "@/types";

// The backend has no query filters, so search and sport filtering happen here
export default function FacilityList({ facilities }: { facilities: Facility[] }) {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const q = query.trim().toLowerCase();
  const shown = facilities.filter(
    (f) => (sport === "all" || f.sportType === sport) && `${f.name} ${f.location}`.toLowerCase().includes(q),
  );
  const hasFilters = sport !== "all" || query.length > 0;

  return (
    <section id="courts" className="mt-8 scroll-mt-6" aria-labelledby="court-list-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="court-list-title" className="cb-title text-2xl font-semibold">สนามทั้งหมด</h2>
        <label className="block w-full sm:w-72">
          <span className="mb-1 block text-sm font-medium">ค้นหาชื่อสนามหรือสถานที่</span>
          <input
            ref={searchInput}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="เช่น เทนนิส หรือสามย่าน"
            className="h-11 w-full rounded-full border border-[var(--line)] bg-white px-4 text-base focus:border-[var(--wine)]"
          />
        </label>
      </div>
      <div className="mt-6">
        <SportFilter value={sport} onChange={setSport} />
      </div>
      <p className="mt-6 text-sm text-stone-600" role="status">{shown.length} สนาม</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((f) => (
          <FacilityCard key={f._id} facility={f} />
        ))}
        {shown.length === 0 && (
          <div className="cb-paper cb-grid-paper col-span-full px-4 py-8 text-center">
            <p className="cb-title text-base font-medium">
              {facilities.length ? "ไม่พบสนามที่ตรงกับการค้นหา" : "ยังไม่มีสนามเปิดให้จอง"}
            </p>
            {facilities.length > 0 && hasFilters && (
              <button
                type="button"
                className="cb-primary mt-4 min-h-11 px-5 text-sm font-medium"
                onClick={() => {
                  setSport("all");
                  setQuery("");
                  searchInput.current?.focus();
                }}
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
