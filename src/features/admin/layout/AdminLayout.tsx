import { Link, NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/features/notification";

const menu = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/orders", label: "Order" },
  { to: "/admin/transactions", label: "Transaksi" },
  { to: "/admin/payouts", label: "Payout" },
  { to: "/admin/users", label: "User" },
  { to: "/admin/disputes", label: "Sengketa" },
  { to: "/admin/audit", label: "Audit log" },
];

function MenuLink({ item }: { item: (typeof menu)[number] }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-2 text-sm whitespace-nowrap",
          isActive
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

const brand = (
  <Link to="/" className="font-heading text-xl leading-none font-bold text-primary">
    TITIP DONG <span className="font-semibold text-muted-foreground">Admin</span>
  </Link>
);

export function Component() {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Desktop: sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar lg:block">
        <div className="flex h-14 items-center justify-between border-b px-4">
          {brand}
          <NotificationBell />
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {menu.map((item) => (
            <MenuLink key={item.to} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile: header + horizontally scrollable menu */}
      <header className="border-b bg-sidebar lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          {brand}
          <NotificationBell />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {menu.map((item) => (
            <MenuLink key={item.to} item={item} />
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
