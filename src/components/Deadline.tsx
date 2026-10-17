import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deadline from the API (payment, request deadline) with date and relative time; turns Rambu in the
 * last 24 hours. Display only: the backend enforces every deadline.
 */
export function Deadline({
  at,
  label,
  className,
}: {
  at: string;
  label: string;
  className?: string;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const left = new Date(at).getTime() - now.getTime();
  const passed = left <= 0;
  const soon = !passed && left < DAY_MS;

  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
        soon ? "bg-highlight text-highlight-foreground" : "bg-muted text-foreground",
        className,
      )}
    >
      <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        {label} <span className="font-semibold">{formatDateTime(at)}</span>{" "}
        {passed ? "(sudah lewat)" : `(${formatRelativeTime(at, now)})`}
      </span>
    </p>
  );
}
