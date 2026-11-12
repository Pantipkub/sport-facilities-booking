"use client";

import { useRef } from "react";

const BTN = "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium";

// Renders the trigger button + a native <dialog>. `action` is a Server Action, e.g. deleteFacility.bind(null, id)
export default function ConfirmDialog({
  title,
  message,
  action,
  confirmLabel = "ลบ",
  trigger = "ลบ",
  triggerClassName = "rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50",
}: {
  title: string;
  message: string;
  action: () => Promise<void>;
  confirmLabel?: string;
  trigger?: string;
  triggerClassName?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={triggerClassName}>
        {trigger}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[calc(100%-3rem)] max-w-sm rounded-2xl bg-white p-6 text-left text-stone-900 shadow-lg backdrop:bg-stone-900/40"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-stone-500">{message}</p>
        <form action={action} className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className={`${BTN} border border-stone-300 bg-white text-stone-700 hover:bg-stone-50`}
          >
            ยกเลิก
          </button>
          <button className={`${BTN} bg-red-600 text-white hover:bg-red-700`}>{confirmLabel}</button>
        </form>
      </dialog>
    </>
  );
}
