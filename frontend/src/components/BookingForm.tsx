import BookingFormFields from "@/components/BookingFormFields";
import { bangkokNow } from "@/libs/format";
import type { Booking, Facility } from "@/types";

type Props = {
  facility: Facility;
  booking?: Booking;
  facilities?: Facility[];
};

export default function BookingForm({ facility, booking, facilities }: Props) {
  return (
    <BookingFormFields
      key={booking?._id ?? facility._id}
      facility={facility}
      booking={booking}
      facilities={facilities}
      initialNow={bangkokNow()}
    />
  );
}
