import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router";
import { FullPageLoader } from "@/components/layout/FullPageLoader";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/auth";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export function App() {
  const initialized = useAuthStore((s) => s.initialized);

  return (
    <QueryClientProvider client={queryClient}>
      {initialized ? <RouterProvider router={router} /> : <FullPageLoader />}
      <Toaster richColors />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
