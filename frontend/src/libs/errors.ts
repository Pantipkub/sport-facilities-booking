const MESSAGES: Record<string, string> = {
  "Cannot reach the server": "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  "Invalid credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Please provide an email and password": "กรุณากรอกอีเมลและรหัสผ่าน",
  "Not authorized to access this route": "การเข้าสู่ระบบหมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่",
  "User no longer exists": "ไม่พบบัญชีผู้ใช้นี้ กรุณาเข้าสู่ระบบใหม่",
  "Email already registered": "อีเมลนี้ถูกใช้สมัครแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ",
  "Facility name already exists": "ชื่อสนามนี้ถูกใช้แล้ว กรุณาใช้ชื่ออื่น",
  "Duplicate value already exists": "ข้อมูลนี้ถูกใช้แล้ว กรุณาตรวจสอบอีกครั้ง",
  "Please add a name": "กรุณากรอกชื่อ-นามสกุล",
  "Please add an email": "กรุณากรอกอีเมล",
  "Please add a valid email": "รูปแบบอีเมลไม่ถูกต้อง",
  "Please add a telephone number": "กรุณากรอกเบอร์โทรศัพท์",
  "Please add a password": "กรุณากรอกรหัสผ่าน",
  "Please add a facility name": "กรุณากรอกชื่อสนาม",
  "Please add a sport type": "กรุณาเลือกประเภทกีฬา",
  "Please add a location": "กรุณากรอกสถานที่",
  "Please add a capacity": "กรุณากรอกความจุของสนาม",
  "Please add an hourly rate": "กรุณากรอกราคาต่อชั่วโมง",
  "Capacity must be at least 1": "ความจุต้องมีอย่างน้อย 1 คน",
  "Hourly rate cannot be negative": "ราคาต่อชั่วโมงต้องไม่ต่ำกว่า 0 บาท",
  "Facility not found": "ไม่พบสนามนี้หรือสนามไม่เปิดให้จองแล้ว",
  "Facility not found or inactive": "สนามนี้ไม่เปิดให้จองแล้ว กรุณาเลือกสนามอื่น",
  "Booking not found": "ไม่พบรายการจองนี้ อาจถูกลบไปแล้ว",
  "Not authorized to view this booking": "คุณไม่มีสิทธิ์ดูรายการจองนี้",
  "Not authorized to edit this booking": "คุณไม่มีสิทธิ์แก้ไขรายการจองนี้",
  "Not authorized to delete this booking": "คุณไม่มีสิทธิ์ลบรายการจองนี้",
  "bookingDate and startTime in HH:mm format are required": "กรุณาเลือกวันที่และเวลาเริ่มต้นให้ครบถ้วน",
  "Please add a booking date": "กรุณาเลือกวันที่ต้องการจอง",
  "Please add a start time": "กรุณาเลือกเวลาเริ่มต้น",
  "Please add a duration": "กรุณาเลือกเวลาสิ้นสุด",
  "Invalid booking date": "วันที่จองไม่ถูกต้อง กรุณาเลือกวันที่ใหม่",
  "Booking date cannot be in the past": "ไม่สามารถจองวันย้อนหลังได้ กรุณาเลือกวันนี้หรือวันถัดไป",
  "Start time must be on the hour or half hour": "กรุณาเลือกเวลาเริ่มต้นเป็นช่วงละ 30 นาที เช่น 16:00 หรือ 16:30",
  "Booking duration must be greater than 0 and at most 2 hours": "จองได้ครั้งละ 30 นาทีถึง 2 ชั่วโมง",
  "Booking duration must be in 30-minute increments": "กรุณาเลือกระยะเวลาเป็นช่วงละ 30 นาที",
  "Booking must end on the same day": "การจองต้องสิ้นสุดภายในวันเดียวกัน ไม่เกิน 24:00",
  "Facility or member already has an overlapping booking": "ช่วงเวลานี้จองไม่ได้ สนามถูกจองแล้วหรือมีการจองที่เวลาซ้อนกัน กรุณาเลือกเวลาใหม่",
  "Too many requests from this IP, please try again later.": "มีการใช้งานมากเกินไป กรุณารอสักครู่แล้วลองใหม่",
};

// Unknown backend text can contain internal details. Only return known Thai messages or a fallback.
export function getErrorMessage(error: string, status?: number, fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง") {
  const message = error.trim();
  if (Object.hasOwn(MESSAGES, message)) return MESSAGES[message];

  if (message.includes("E11000")) {
    if (/\bemail(?:\b|_)/i.test(message)) return MESSAGES["Email already registered"];
    if (/\bname(?:\b|_)/i.test(message)) return MESSAGES["Facility name already exists"];
    return MESSAGES["Duplicate value already exists"];
  }
  const validationMessages = Object.entries(MESSAGES)
    .filter(([known]) => known.startsWith("Please add ") || known.startsWith("Capacity must ") || known.startsWith("Hourly rate "))
    .filter(([known]) => message.includes(known))
    .map(([, translated]) => translated);
  if (validationMessages.length) return [...new Set(validationMessages)].join(" / ");

  if (status === 0) return MESSAGES["Cannot reach the server"];
  if (status === 401) return MESSAGES["Not authorized to access this route"];
  if (status === 403) return "คุณไม่มีสิทธิ์ทำรายการนี้";
  if (status === 404) return "ไม่พบข้อมูลที่ต้องการ อาจถูกลบไปแล้ว";
  if (status === 409) return MESSAGES["Facility or member already has an overlapping booking"];
  if (status === 400 || status === 422) return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (status === 429) return MESSAGES["Too many requests from this IP, please try again later."];
  return fallback;
}
