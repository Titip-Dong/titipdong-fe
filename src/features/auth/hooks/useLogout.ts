import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout as logoutRequest } from "@/api/generated/endpoints/auth/auth";
import { useAuthStore } from "@/stores/auth";

/** Ends the session and leaves the cache of the previous user behind. */
export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async () => {
    // Clear the local session even if the request fails; the refresh cookie then expires on its own.
    await logoutRequest().catch(() => undefined);
    // On guarded pages RequireAuth follows the sign-out target; elsewhere navigate does.
    clear({ to: "/" });
    queryClient.clear();
    navigate("/");
  };
}
