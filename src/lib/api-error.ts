import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/api/client";
import type { ErrorModel } from "@/api/generated/model";

/**
 * Indonesian message for a failed request. Backend `detail` texts are English, so pages pass
 * their own copy per expected status code; anything else gets a generic message.
 */
export function errorMessage(
  error: unknown,
  messages: Partial<Record<number, string>> = {},
): string {
  if (error instanceof ApiError) {
    const message = messages[error.status];
    if (message) return message;
    if (error.status === 401) return "Sesi kamu sudah habis. Masuk lagi, ya.";
    if (error.status === 409) return "Datanya sudah berubah. Muat ulang halaman, lalu coba lagi.";
    if (error.status === 422) return "Ada isian yang belum sesuai. Cek lagi, ya.";
  }
  return "Terjadi kesalahan. Coba lagi sebentar lagi, ya.";
}

/**
 * Marks the form fields named in a 422 response (`errors[].location`, e.g. "body.items[0].name").
 * Returns true when at least one field was marked, so the caller can skip a generic toast.
 */
export function setFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  message = "Isian ini belum sesuai. Cek lagi, ya.",
): boolean {
  if (!(error instanceof ApiError) || error.status !== 422) return false;
  const details = (error.body as ErrorModel | undefined)?.errors ?? [];
  let marked = false;
  for (const { location } of details) {
    if (!location?.startsWith("body.")) continue;
    const field = location.slice("body.".length).replace(/\[(\d+)\]/g, ".$1");
    setError(field as Path<T>, { type: "server", message });
    marked = true;
  }
  return marked;
}
