const VARIANTS = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
};

export default function Alert({ variant, children }: { variant: keyof typeof VARIANTS; children: React.ReactNode }) {
  return (
    <div role={variant === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant]}`}>
      {children}
    </div>
  );
}
