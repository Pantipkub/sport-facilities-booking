import type { Booking } from "../types";

export function filterBookings(bookings: Booking[], query: string, facilityId: string) {
  const search = query.trim().toLocaleLowerCase("th-TH");
  return bookings.filter((booking) => {
    const owner = `${booking.user?.name ?? ""} ${booking.user?.email ?? ""}`.toLocaleLowerCase("th-TH");
    return (!facilityId || booking.facility?._id === facilityId) && (!search || owner.includes(search));
  });
}

export function bookedFacilities(bookings: Booking[]) {
  const facilities = new Map<string, { id: string; name: string }>();
  for (const booking of bookings) {
    if (booking.facility) facilities.set(booking.facility._id, { id: booking.facility._id, name: booking.facility.name });
  }
  return [...facilities.values()].sort((left, right) => left.name.localeCompare(right.name, "th"));
}
