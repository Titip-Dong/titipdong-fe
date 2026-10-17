import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import type { NavItem } from "./navigation";

/** Phone navigation for Pembeli and Jastiper; hidden from `md`, where the top bar takes over. */
export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul
        className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs outline-none focus-visible:bg-muted",
                  isActive ? "font-semibold text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
