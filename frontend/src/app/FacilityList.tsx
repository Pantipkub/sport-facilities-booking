"use client";

import { useState } from "react";
import FacilityCard from "@/components/FacilityCard";
import SportFilter from "@/components/SportFilter";
import type { Facility } from "@/types";

// The backend has no query filters, so search and sport filtering happen here
export default function FacilityList({ facilities }: { facilities: Facility[] }) {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = facilities.filter(
    (f) => (sport === "all" || f.sportType === sport) && `${f.name} ${f.location}`.toLowerCase().includes(q),
  );

  return (
    <section id="courts" className="mt-8 scroll-mt-6" aria-labelledby="court-list-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="court-list-title" className="cb-title text-2xl font-semibold">สนามทั้งหมด</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อสนามหรือสถานที่"
          aria-label="ค้นหาชื่อสนามหรือสถานที่"
          className="h-11 w-full rounded-full border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--wine)] focus:ring-2 focus:ring-[var(--sky)] sm:w-72"
        />
      </div>
      <div className="mt-6">
        <SportFilter value={sport} onChange={setSport} />
      </div>
      <p className="mt-6 text-sm text-stone-500">{shown.length} สนาม</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((f) => (
          <FacilityCard key={f._id} facility={f} />
        ))}
        {shown.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
            ไม่พบสนามที่ตรงกับการค้นหา
          </p>
        )}
      </div>
    </section>
  );
}
