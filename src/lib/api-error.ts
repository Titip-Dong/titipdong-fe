import { ApiError } from "@/api/client";

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
  }
  return "Terjadi kesalahan. Coba lagi sebentar lagi, ya.";
}
