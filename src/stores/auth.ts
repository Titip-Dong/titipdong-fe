import { create } from "zustand";
import type { UserResponse, UserResponseRole } from "@/api/generated/model";

export type Role = UserResponseRole;
export type AuthUser = UserResponse;

/** Where the guards send the user after an intentional sign-out, instead of their default /login redirect. */
export interface AfterSignOut {
  to: string;
  state?: unknown;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  /** True once the initial session restore (refresh) attempt has finished. */
  initialized: boolean;
  afterSignOut: AfterSignOut | null;
  setSession: (token: string, user: AuthUser) => void;
  /** Keeps the session user in sync after the user edits their own profile. */
  setUser: (user: AuthUser) => void;
  clear: (afterSignOut?: AfterSignOut) => void;
  setInitialized: () => void;
  hasRole: (role: Role) => boolean;
}

// The access token lives in memory only (no `persist`); the refresh token is in an HttpOnly cookie.
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  initialized: false,
  afterSignOut: null,
  setSession: (accessToken, user) => set({ accessToken, user, afterSignOut: null }),
  setUser: (user) => set({ user }),
  clear: (afterSignOut) =>
    set({ accessToken: null, user: null, afterSignOut: afterSignOut ?? null }),
  setInitialized: () => set({ initialized: true }),
  hasRole: (role) => get().user?.role === role,
}));
