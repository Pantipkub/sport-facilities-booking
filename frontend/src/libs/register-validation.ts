export type RegisterField = "name" | "email" | "tel" | "password";

// Shared by inline feedback and the server action so both enforce the same rules.
export function registerFieldError(field: RegisterField, value: string): string | undefined {
  switch (field) {
    case "name":
      return value.trim() ? undefined : "กรุณากรอกชื่อ-นามสกุล";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "รูปแบบอีเมลไม่ถูกต้อง";
    case "tel":
      return /^\d{9,10}$/.test(value.trim()) ? undefined : "เบอร์โทรต้องเป็นตัวเลข 9 ถึง 10 หลัก";
    case "password":
      return value.length >= 6 ? undefined : "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  }
}
