import BookingFormFields from "@/components/BookingFormFields";
import { bangkokNow } from "@/libs/format";
import type { Booking, Facility } from "@/types";
import type { BookingFormState } from "@/app/bookings/actions";

type Props = {
  facility: Facility;
  booking?: Booking;
  facilities?: Facility[];
  action?: (previous: BookingFormState, formData: FormData) => Promise<BookingFormState>;
};

export default function BookingForm({ facility, booking, facilities, action }: Props) {
  return (
    <BookingFormFields
      key={booking?._id ?? facility._id}
      facility={facility}
      booking={booking}
      facilities={facilities}
      action={action}
      initialNow={bangkokNow()}
    />
  );
}
