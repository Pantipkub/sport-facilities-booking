import { SPORTS } from "@/libs/sports";
import TennisBallIcon from "@/components/TennisBallIcon";

const OPTIONS = [["all", "ทั้งหมด"], ...Object.entries(SPORTS).map(([key, s]) => [key, s.label])];

export default function SportFilter({ value, onChange }: { value: string; onChange: (sport: string) => void }) {
  return (
    <div role="group" aria-label="กรองตามประเภทกีฬา" className="flex flex-wrap gap-2">
      {OPTIONS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={key === value}
          onClick={() => onChange(key)}
          className="cb-sport-sticker inline-flex min-h-11 items-center justify-center gap-2 rounded-full border text-center text-sm font-medium"
        >
          <TennisBallIcon className="cb-sticker-ball size-4 shrink-0" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
