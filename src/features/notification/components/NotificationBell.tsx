import { BellIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

/** Notification icon in the navbar. */
export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link to="/notifications" aria-label="Notifikasi">
        <BellIcon />
      </Link>
    </Button>
  );
}
