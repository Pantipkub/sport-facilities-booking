import { sportOf } from "@/libs/sports";
import type { Facility } from "@/types";

// Photo when the facility has imageUrl (E1), otherwise a tinted panel in the sport's color
export default function FacilityImage({
  facility,
  className = "aspect-[16/9]",
  small = false, // table thumbnails
}: {
  facility: Facility;
  className?: string;
  small?: boolean;
}) {
  if (facility.imageUrl) {
    // plain <img>: uploaded photos live on Vercel Blob, so next/image would need remotePatterns
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={facility.imageUrl} alt={facility.name} className={`w-full object-cover ${className}`} />;
  }
  const sport = sportOf(facility.sportType);
  return (
    <div className={`grid place-items-center ${sport.color} ${className}`}>
      <span className={`${small ? "text-[9px]" : "text-lg"} font-semibold opacity-50`}>{sport.label}</span>
    </div>
  );
}
