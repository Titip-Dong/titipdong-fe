import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { refreshAccessToken } from "@/api/client";
import { App } from "@/app/App";
import { useAuthStore } from "@/stores/auth";
import "./index.css";

// Validation messages from the generated Zod schemas in Indonesian.
z.config(z.locales.id());

// Restore the session from the refresh token cookie once, when the app first loads.
void refreshAccessToken().finally(() => useAuthStore.getState().setInitialized());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
