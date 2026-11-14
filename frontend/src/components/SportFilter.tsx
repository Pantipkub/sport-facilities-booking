import { SPORTS } from "@/libs/sports";

const OPTIONS = [["all", "ทั้งหมด"], ...Object.entries(SPORTS).map(([key, s]) => [key, s.label])];

export default function SportFilter({ value, onChange }: { value: string; onChange: (sport: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={key === value}
          onClick={() => onChange(key)}
          className="cb-sport-sticker inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-medium"
        >
          <span aria-hidden="true" className="cb-sticker-mark">✓</span>
          {label}
        </button>
      ))}
    </div>
  );
}
