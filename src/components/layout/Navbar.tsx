import { MenuIcon } from "lucide-react";
import { useState } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

/** Phone menu for the main links; a regular web menu, not an app tab bar. */
function MenuSheet({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigasi utama" className="flex flex-col p-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive ? "font-bold text-primary" : "font-semibold hover:bg-muted",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

/** Top bar. With `items` (Pembeli, Jastiper) the main links show inline from `md` and in a menu sheet below it. */
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

        {items ? (
          <nav aria-label="Navigasi utama" className="hidden items-center gap-5 md:flex">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <nav aria-label="Navigasi utama" className="flex items-center gap-5">
            <NavLink to="/trips" className={linkClass}>
              Cari trip
            </NavLink>
          </nav>
        )}

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
              {items && <MenuSheet items={items} />}
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
