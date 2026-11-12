export const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;

// "HH:mm" <-> minutes since midnight
export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, "0");
export const fromMinutes = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

// "16:00" + 1.5 -> "17:30"
export const endTime = (start: string, hours: number) => fromMinutes(toMinutes(start) + hours * 60);

// "YYYY-MM-DD" or bookingDate (UTC midnight ISO) -> Thai date, read in UTC so the day never shifts
export const thaiDate = (
  date: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" },
) => new Date(`${date.slice(0, 10)}T00:00:00Z`).toLocaleDateString("th-TH", { ...options, timeZone: "UTC" });

// The courts are in Bangkok: "today" and "now" come from there, not from the server's clock zone
export function bangkokNow() {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }); // YYYY-MM-DD
  const time = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return { date, minutes: toMinutes(time) };
}
