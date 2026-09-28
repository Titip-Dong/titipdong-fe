import { Link, NavLink, useNavigate } from "react-router";
import { logout as logoutRequest } from "@/api/generated/endpoints/auth/auth";
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
import { useAuthStore } from "@/stores/auth";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  const logout = async () => {
    // Clear the local session even if the request fails; the refresh cookie then expires on its own.
    await logoutRequest().catch(() => undefined);
    clear();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6">
        <Link
          to="/"
          className="font-heading text-xl leading-none font-bold whitespace-nowrap text-primary sm:text-2xl"
        >
          TITIP DONG
        </Link>
        <nav className="flex items-center gap-4 text-sm whitespace-nowrap">
          <NavLink
            to="/trips"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-foreground underline decoration-2 underline-offset-8"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            Cari trip
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profil</Link>
                  </DropdownMenuItem>
                  {hasRole("buyer") && (
                    <DropdownMenuItem asChild>
                      <Link to="/orders">Titipan Saya</Link>
                    </DropdownMenuItem>
                  )}
                  {hasRole("jastiper") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/my-trips">Trip Saya</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders">Titipan Masuk</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/wallet">Saldo</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {hasRole("admin") && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Dashboard Admin</Link>
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
