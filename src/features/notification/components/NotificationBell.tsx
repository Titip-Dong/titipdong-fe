import { BellIcon } from "lucide-react";
import { Link } from "react-router";
import { useGetUnreadCount } from "@/api/generated/endpoints/notification/notification";
import { Button } from "@/components/ui/button";

const POLL_MS = 30_000;

/** Notification icon in the navbar with the unread count, polled while the tab is visible. */
export function NotificationBell() {
  const { data } = useGetUnreadCount({
    query: { refetchInterval: POLL_MS, refetchIntervalInBackground: false },
  });
  const count = data?.count ?? 0;

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link
        to="/notifications"
        className="relative"
        aria-label={count > 0 ? `Notifikasi, ${count} belum dibaca` : "Notifikasi"}
      >
        <BellIcon />
        {count > 0 && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground tabular-nums"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
