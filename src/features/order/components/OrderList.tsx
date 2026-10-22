import { Link } from "react-router";
import type { ListOrdersStatus } from "@/api/generated/model";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useOrders } from "../hooks/useOrders";

const filters: { value: ListOrdersStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "requested", label: "Perlu persetujuan" },
  { value: "approved", label: "Menunggu bayar" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "paid", label: "Perlu dikirim" },
  { value: "shipped", label: "Dikirim" },
  { value: "disputed", label: "Dalam sengketa" },
  { value: "delivered", label: "Diterima" },
  { value: "released", label: "Selesai" },
  { value: "refunded", label: "Refund" },
];

/** Orders of the signed-in user with status filters; optionally limited to one trip. */
export function OrderList({
  status,
  onStatusChange,
  tripId,
  empty,
}: {
  status: ListOrdersStatus | "";
  onStatusChange: (status: ListOrdersStatus | "") => void;
  tripId?: string;
  empty: string;
}) {
  const userId = useAuthStore((s) => s.user?.id);
  const orders = useOrders({ status: status || undefined, tripId, limit: 20 });
  const items = orders.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={status === f.value}
            onClick={() => onStatusChange(f.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              status === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {orders.isPending ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : orders.isError ? (
        <p className="text-destructive">Titipan gagal dimuat. Muat ulang halaman, ya.</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-muted-foreground">{empty}</div>
      ) : (
        <>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {items.map((o) => {
              const counterpart =
                o.buyer.id === userId ? `Jastiper ${o.jastiper.name}` : `Dari ${o.buyer.name}`;
              return (
                <li key={o.id}>
                  <Link
                    to={`/orders/${o.id}`}
                    className="flex items-center gap-4 p-4 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 sm:p-5"
                  >
                    <ProductImage
                      src={o.photoUrl}
                      name={o.productName}
                      tone="paspor"
                      className="size-14 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="line-clamp-1 font-medium">
                        {o.productName} <span className="text-muted-foreground">×{o.quantity}</span>
                      </p>
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {o.trip.title} · {counterpart}
                      </p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <div className="hidden text-right text-sm sm:block">
                      <p className="font-medium tabular-nums">
                        {o.total !== undefined ? formatRupiah(o.total) : "Menunggu harga"}
                      </p>
                      <p className="text-muted-foreground">
                        {o.code} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {orders.hasNextPage && (
            <Button
              variant="outline"
              onClick={() => orders.fetchNextPage()}
              disabled={orders.isFetchingNextPage}
            >
              {orders.isFetchingNextPage ? "Memuat..." : "Muat titipan lainnya"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
