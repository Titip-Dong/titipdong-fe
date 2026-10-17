const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
const dateTime = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

/** Formats an integer rupiah amount from the API, e.g. 150000 -> "Rp 150.000". */
export function formatRupiah(amount: number): string {
  return rupiah.format(amount);
}

/** Formats an ISO date from the API, e.g. "2026-09-26" -> "26 Sep 2026". */
export function formatDate(value: string | Date): string {
  return date.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTime.format(new Date(value));
}

const relative = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

/** Relative time for deadlines, e.g. "dalam 3 jam", "2 hari yang lalu". */
export function formatRelativeTime(value: string | Date, now: Date = new Date()): string {
  const minutes = Math.round((new Date(value).getTime() - now.getTime()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}
