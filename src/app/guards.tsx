import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore, type Role } from "@/stores/auth";

/** Without a session: the sign-out target if the user just signed out, otherwise /login and back. */
function SignedOutRedirect() {
  const afterSignOut = useAuthStore((s) => s.afterSignOut);
  const location = useLocation();
  if (afterSignOut) return <Navigate to={afterSignOut.to} state={afterSignOut.state} replace />;
  return <Navigate to="/login" state={{ from: location }} replace />;
}

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <SignedOutRedirect />;
  return <Outlet />;
}

export function RequireRole({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole(role));
  if (!user) return <SignedOutRedirect />;
  if (!hasRole) return <Navigate to="/" replace />;
  return <Outlet />;
}
