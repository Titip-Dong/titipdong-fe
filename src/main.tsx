import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { refreshAccessToken } from "@/api/client";
import { App } from "@/app/App";
import { useAuthStore } from "@/stores/auth";
import "./index.css";

// Restore the session from the refresh token cookie once, when the app first loads.
void refreshAccessToken().finally(() => useAuthStore.getState().setInitialized());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
