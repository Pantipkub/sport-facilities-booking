import { SPORTS } from "@/libs/sports";
import TennisBallIcon from "@/components/TennisBallIcon";

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
          className="cb-sport-sticker relative inline-flex min-h-10 items-center justify-center rounded-full border px-7 text-center text-sm font-medium"
        >
          {key === value && <TennisBallIcon className="absolute left-2 size-4" />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
