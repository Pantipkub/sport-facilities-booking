import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { api } from "@/libs/api";
import { isBookingDate, type BusyTimes } from "@/libs/booking-time";
import { toMinutes } from "@/libs/format";
import type { Booking } from "@/types";

const objectId = /^[a-f\d]{24}$/i;
const privateHeaders = { "Cache-Control": "private, no-store" };

function fail(status: number) {
  return new Response(null, { status, headers: privateHeaders });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const facility = params.get("facility")?.toLowerCase() ?? "";
  const date = params.get("date") ?? "";
  const exclude = params.get("exclude")?.toLowerCase();
  if (!objectId.test(facility) || !isBookingDate(date) || (exclude !== undefined && !objectId.test(exclude))) {
    return fail(400);
  }

  const user = (await getServerSession(authOptions))?.user;
  if (!user?.token) return fail(401);

  let owner = user.id;
  if (exclude) {
    const booking = await api<Booking>(`/bookings/${exclude}`, { token: user.token });
    if (!booking.ok) return fail(booking.status || 502);
    const bookingOwner = booking.data?.user?._id;
    if (!bookingOwner) return fail(404);
    if (user.role !== "admin" && bookingOwner !== user.id) return fail(403);
    owner = bookingOwner;
  } else if (user.role !== "member") {
    return fail(403);
  }

  const query = new URLSearchParams({ date });
  if (exclude) query.set("exclude", exclude);
  const [availability, bookings] = await Promise.all([
    api<{ date: string; booked: { startTime: string; endTime: string }[] }>(`/facilities/${facility}/availability?${query}`),
    api<Booking[]>("/bookings", { token: user.token }),
  ]);
  if (!availability.ok) return fail(availability.status || 502);
  if (!bookings.ok) return fail(bookings.status || 502);

  const busy = {
    taken: availability.data.booked.map(({ startTime, endTime }) => ({
      start: toMinutes(startTime),
      end: toMinutes(endTime),
    })),
    mine: bookings.data
      .filter((booking) => booking._id !== exclude && booking.user?._id === owner &&
        booking.facility?._id !== facility && booking.bookingDate.slice(0, 10) === date)
      .map((booking) => {
        const start = toMinutes(booking.startTime);
        return { start, end: start + booking.durationHours * 60 };
      }),
  } satisfies BusyTimes;
  return Response.json(busy, { headers: privateHeaders });
}
