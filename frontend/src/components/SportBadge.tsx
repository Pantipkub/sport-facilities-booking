import { sportOf } from "@/libs/sports";

export default function SportBadge({ sportType }: { sportType: string }) {
  const sport = sportOf(sportType);
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${sport.color}`}>{sport.label}</span>;
}
