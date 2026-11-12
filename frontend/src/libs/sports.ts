export const SPORTS = {
  badminton: { label: "แบดมินตัน", color: "bg-sky-50 text-sky-700" },
  tennis: { label: "เทนนิส", color: "bg-lime-50 text-lime-700" },
  futsal: { label: "ฟุตซอล", color: "bg-emerald-50 text-emerald-700" },
  basketball: { label: "บาสเกตบอล", color: "bg-orange-50 text-orange-700" },
  volleyball: { label: "วอลเลย์บอล", color: "bg-amber-50 text-amber-700" },
  "table-tennis": { label: "ปิงปอง", color: "bg-rose-50 text-rose-700" },
  gym: { label: "ฟิตเนส", color: "bg-slate-100 text-slate-700" },
};

export type SportKey = keyof typeof SPORTS;

// sportType is free text in the backend, so unknown values get a neutral badge
export function sportOf(sportType: string) {
  return SPORTS[sportType as SportKey] ?? { label: sportType, color: "bg-stone-100 text-stone-700" };
}
