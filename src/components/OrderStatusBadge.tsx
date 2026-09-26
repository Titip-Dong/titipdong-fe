import { cn } from "@/lib/utils";

// TODO(F03): align status values with the enum in the backend OpenAPI spec.
export type OrderStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled"
  | "paid"
  | "shipped"
  | "delivered"
  | "disputed"
  | "released"
  | "refunded";

const statusStyle: Record<OrderStatus, { label: string; className: string }> = {
  requested: { label: "Menunggu persetujuan", className: "border-border bg-card text-foreground" },
  approved: {
    label: "Menunggu pembayaran",
    className: "border-transparent bg-highlight text-highlight-foreground",
  },
  rejected: { label: "Ditolak", className: "border-transparent bg-muted text-muted-foreground" },
  cancelled: {
    label: "Dibatalkan",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  paid: {
    label: "Dibayar, dana ditahan",
    className: "border-transparent bg-secondary text-secondary-foreground",
  },
  shipped: {
    label: "Dikirim",
    className: "border-transparent bg-secondary text-secondary-foreground",
  },
  delivered: {
    label: "Diterima",
    className: "border-transparent bg-primary text-primary-foreground",
  },
  disputed: {
    label: "Dalam sengketa",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  released: {
    label: "Dana dicairkan",
    className: "border-transparent bg-primary text-primary-foreground",
  },
  refunded: {
    label: "Dana dikembalikan",
    className: "border-border bg-card text-muted-foreground",
  },
};

/** Order status with the same colors across every module. */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const { label, className: variant } = statusStyle[status];
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex h-6 w-fit items-center rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        variant,
        className,
      )}
    >
      {label}
    </span>
  );
}
