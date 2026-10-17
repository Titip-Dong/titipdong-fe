import { Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { navItems } from "./navigation";

export function MainLayout() {
  const role = useAuthStore((s) => s.user?.role);
  const items = role ? navItems[role] : undefined;

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col",
        items && "pb-16 [--bottom-nav-height:4rem] md:pb-0 md:[--bottom-nav-height:0px]",
      )}
    >
      <Navbar items={items} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {items && <BottomNav items={items} />}
    </div>
  );
}
