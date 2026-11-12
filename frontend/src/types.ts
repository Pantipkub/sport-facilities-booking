export type Role = "member" | "admin";

export interface Facility {
  _id: string;
  name: string;
  sportType: string;
  location: string;
  capacity: number;
  hourlyRate: number;
  imageUrl?: string;
}

export interface Booking {
  _id: string;
  facility: Facility;
  user: { _id: string; name: string; email: string; tel: string; role: Role };
  bookingDate: string; // ISO at UTC midnight: format with timeZone "UTC"
  startTime: string; // "HH:mm"
  durationHours: number;
}
