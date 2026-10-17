import {
  CalendarDaysIcon,
  HouseIcon,
  InboxIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/stores/auth";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Main navigation per role: bottom bar on phones, top bar from `md` (DESIGN.md §5, App shell). */
export const navItems: Partial<Record<Role, NavItem[]>> = {
  buyer: [
    { to: "/", label: "Beranda", icon: HouseIcon, end: true },
    { to: "/trips", label: "Cari trip", icon: SearchIcon },
    { to: "/orders", label: "Titipan", icon: ShoppingBagIcon },
    { to: "/profile", label: "Profil", icon: UserIcon },
  ],
  jastiper: [
    { to: "/my-trips", label: "Trip saya", icon: CalendarDaysIcon },
    { to: "/orders", label: "Titipan masuk", icon: InboxIcon },
    { to: "/wallet", label: "Saldo", icon: WalletIcon },
    { to: "/profile", label: "Profil", icon: UserIcon },
  ],
};
