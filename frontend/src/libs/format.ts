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

// Fixed tables, not Intl: Node and browsers ship different th-TH ICU data ("พ." vs "พุธ"),
// which breaks hydration when a client component renders a date
const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// "YYYY-MM-DD" or bookingDate (UTC midnight ISO) -> Thai date, read in UTC so the day never shifts
// short: "พ. 18 พ.ย. 2569" · long: "วันพุธที่ 18 พฤศจิกายน 2569" · dayMonth: "18 พ.ย."
export const thaiDate = (date: string, style: "short" | "long" | "dayMonth" = "short") => {
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  const [wd, day, m, year] = [d.getUTCDay(), d.getUTCDate(), d.getUTCMonth(), d.getUTCFullYear() + 543];
  if (style === "long") return `วัน${DAYS[wd]}ที่ ${day} ${MONTHS[m]} ${year}`;
  if (style === "dayMonth") return `${day} ${MONTHS_SHORT[m]}`;
  return `${DAYS_SHORT[wd]} ${day} ${MONTHS_SHORT[m]} ${year}`;
};

// The courts are in Bangkok: "today" and "now" come from there, not from the server's clock zone
export function bangkokNow() {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }); // YYYY-MM-DD
  const time = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return { date, minutes: toMinutes(time) };
}
