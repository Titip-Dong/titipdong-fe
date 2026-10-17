import { Link, NavLink } from "react-router";
import { useLogout } from "@/features/auth";
import { NotificationBell } from "@/features/notification";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import type { NavItem } from "./navigation";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md py-1 text-sm whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    isActive
      ? "font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-8"
      : "text-muted-foreground hover:text-foreground",
  );

/** Top bar. With `items` (Pembeli, Jastiper) the main links show from `md`; phones use BottomNav. */
export function Navbar({ items }: { items?: NavItem[] }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="shrink-0 rounded-sm">
          <img
            src="/titipdong-logo-navbar.png"
            alt="TITIP DONG"
            width={205}
            height={96}
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-5">
          {items ? (
            items
              .filter((item) => item.to !== "/profile")
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={(state) => cn(linkClass(state), "hidden md:inline")}
                >
                  {item.label}
                </NavLink>
              ))
          ) : (
            <NavLink to="/trips" className={linkClass}>
              Cari trip
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Menu akun"
                  >
                    <Avatar>
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <span className="block truncate">{user.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {roleLabel[user.role]}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Dashboard admin</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profil</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={logout}>Keluar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
