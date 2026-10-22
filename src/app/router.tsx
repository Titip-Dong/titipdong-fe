import { createBrowserRouter } from "react-router";
import { FullPageLoader } from "@/components/layout/FullPageLoader";
import { MainLayout } from "@/components/layout/MainLayout";
import { NotFoundPage } from "@/components/layout/NotFoundPage";
import { RequireAuth, RequireRole } from "./guards";

// Every page file exports its component as `Component` so it can be lazy loaded.
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    HydrateFallback: FullPageLoader,
    children: [
      // Public — F02
      { path: "/", lazy: () => import("@/features/trip/pages/LandingPage") },
      { path: "/trips", lazy: () => import("@/features/trip/pages/TripListPage") },
      { path: "/trip/:slug", lazy: () => import("@/features/trip/pages/TripDetailPage") },
      // Auth — F01
      { path: "/login", lazy: () => import("@/features/auth/pages/LoginPage") },
      { path: "/register", lazy: () => import("@/features/auth/pages/RegisterPage") },

      {
        element: <RequireAuth />,
        children: [
          { path: "/profile", lazy: () => import("@/features/auth/pages/ProfilePage") },
          {
            path: "/notifications",
            lazy: () => import("@/features/notification/pages/NotificationPage"),
          },
          { path: "/orders", lazy: () => import("@/features/order/pages/OrderListPage") },
          { path: "/orders/:id", lazy: () => import("@/features/order/pages/OrderDetailPage") },

          {
            element: <RequireRole role="buyer" />,
            children: [
              {
                path: "/trip/:slug/request",
                lazy: () => import("@/features/order/pages/RequestFormPage"),
              },
              { path: "/orders/:id/pay", lazy: () => import("@/features/payment/pages/PayPage") },
              {
                path: "/orders/:id/dispute",
                lazy: () => import("@/features/dispute/pages/DisputeFormPage"),
              },
            ],
          },
          {
            element: <RequireRole role="jastiper" />,
            children: [
              { path: "/my-trips", lazy: () => import("@/features/trip/pages/MyTripsPage") },
              { path: "/my-trips/new", lazy: () => import("@/features/trip/pages/TripFormPage") },
              {
                path: "/my-trips/:slug",
                lazy: () => import("@/features/trip/pages/ManageTripPage"),
              },
              {
                path: "/my-trips/:slug/edit",
                lazy: () => import("@/features/trip/pages/TripFormPage"),
              },
              {
                path: "/my-trips/:id/requests",
                lazy: () => import("@/features/order/pages/RequestInboxPage"),
              },
              { path: "/wallet", lazy: () => import("@/features/payment/pages/WalletPage") },
            ],
          },
        ],
      },

      // Team visual reference, development only.
      ...(import.meta.env.DEV
        ? [
            {
              path: "/styleguide",
              lazy: () => import("@/components/styleguide/StyleguidePage"),
            },
          ]
        : []),

      { path: "*", element: <NotFoundPage /> },
    ],
  },

  // Admin — layout from F08, pages from their owning modules
  {
    path: "/admin",
    element: <RequireRole role="admin" />,
    HydrateFallback: FullPageLoader,
    children: [
      {
        lazy: () => import("@/features/admin/layout/AdminLayout"),
        children: [
          { index: true, lazy: () => import("@/features/admin/pages/DashboardPage") },
          { path: "orders", lazy: () => import("@/features/admin/pages/OrdersPage") },
          { path: "transactions", lazy: () => import("@/features/admin/pages/TransactionsPage") },
          { path: "payouts", lazy: () => import("@/features/admin/pages/PayoutsPage") },
          { path: "users", lazy: () => import("@/features/admin/pages/UsersPage") },
          { path: "audit", lazy: () => import("@/features/admin/pages/AuditLogPage") },
          {
            path: "disputes",
            lazy: () => import("@/features/dispute/pages/admin/DisputeListPage"),
          },
          {
            path: "disputes/:id",
            lazy: () => import("@/features/dispute/pages/admin/DisputeDetailPage"),
          },
        ],
      },
    ],
  },
]);
