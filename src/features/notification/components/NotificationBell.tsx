import { BellIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useGetUnreadCount } from "@/api/generated/endpoints/notification/notification";

/** Notification icon in the navbar. */
export function NotificationBell() {
  const { data } = useGetUnreadCount({ query: { refetchInterval: 30_000 } });
  const count = data?.count ?? 0;
  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link
        to="/notifications"
        aria-label={count ? `Notifikasi, ${count} belum dibaca` : "Notifikasi"}
      >
        <BellIcon />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
