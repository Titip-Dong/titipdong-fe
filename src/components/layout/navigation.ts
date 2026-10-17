import type { Role } from "@/stores/auth";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

/** Main links per role: inline in the navbar from `md`, in the menu sheet on phones (DESIGN.md §5). */
export const navItems: Partial<Record<Role, NavItem[]>> = {
  buyer: [
    { to: "/", label: "Beranda", end: true },
    { to: "/trips", label: "Cari trip" },
    { to: "/orders", label: "Titipan" },
  ],
  jastiper: [
    { to: "/my-trips", label: "Trip saya" },
    { to: "/orders", label: "Titipan masuk" },
    { to: "/wallet", label: "Saldo" },
  ],
};
