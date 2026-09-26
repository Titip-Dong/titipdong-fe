import { create } from "zustand";

export type Role = "jastiper" | "pembeli" | "admin";

// TODO(F01): replace with the orval-generated type (e.g. `UserResponse` from "@/api/generated/model")
// once the auth endpoints exist in the backend OpenAPI spec.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

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
  hasRole: (role) => get().user?.roles?.includes(role) ?? false,
}));
