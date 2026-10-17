import type { UserResponseRole } from "@/api/generated/model";

/** Where each role lands after login or registration (DESIGN.md §5, docs/FLOWS.md §2). */
export const roleHome: Record<UserResponseRole, string> = {
  buyer: "/",
  jastiper: "/my-trips",
  admin: "/admin",
};

export const roleLabel: Record<UserResponseRole, string> = {
  buyer: "Pembeli",
  jastiper: "Jastiper",
  admin: "Admin",
};
