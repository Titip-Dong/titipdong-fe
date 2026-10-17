import { Outlet } from "react-router";
import { useAuthStore } from "@/stores/auth";
import { Navbar } from "./Navbar";
import { navItems } from "./navigation";

export function MainLayout() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar items={role ? navItems[role] : undefined} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
