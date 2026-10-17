import { create } from "zustand";
import type { UserResponse, UserResponseRole } from "@/api/generated/model";

export type Role = UserResponseRole;
export type AuthUser = UserResponse;

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  /** True once the initial session restore (refresh) attempt has finished. */
  initialized: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
  setInitialized: () => void;
  hasRole: (role: Role) => boolean;
}

// The access token lives in memory only (no `persist`); the refresh token is in an HttpOnly cookie.
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  initialized: false,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
  setInitialized: () => set({ initialized: true }),
  hasRole: (role) => get().user?.role === role,
}));
