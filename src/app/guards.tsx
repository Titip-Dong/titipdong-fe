import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore, type Role } from "@/stores/auth";

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RequireRole({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole(role));
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!hasRole) return <Navigate to="/" replace />;
  return <Outlet />;
}
