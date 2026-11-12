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
          className={`h-9 rounded-full border px-4 text-sm font-medium ${
            key === value
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-300 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
