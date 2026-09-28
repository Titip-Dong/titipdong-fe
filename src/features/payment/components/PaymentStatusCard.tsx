import { ClockIcon, ShieldCheckIcon } from "lucide-react";
import { Link } from "react-router";
import type { OrderResponse } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

/** Payment and escrow state of an order. Embedded below the tear line of the order receipt (F03). */
export function PaymentStatusCard({ order }: { order: OrderResponse }) {
  const isBuyer = useAuthStore((s) => s.user?.id === order.buyer.id);
  const total = order.total !== undefined ? formatRupiah(order.total) : "";

  switch (order.status) {
    case "approved":
      return (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="flex max-w-sm items-start gap-2 text-sm">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {isBuyer ? "Bayar" : "Menunggu pembeli membayar"} sebelum{" "}
            {order.paymentDeadline && formatDateTime(order.paymentDeadline)}. Lewat dari itu,
            titipan batal otomatis.
          </p>
          {isBuyer && (
            <Button asChild>
              <Link to={`/orders/${order.id}/pay`}>Bayar sekarang</Link>
            </Button>
          )}
        </div>
      );
    case "paid":
    case "shipped":
    case "delivered":
    case "disputed":
      return (
        <p className="flex max-w-md items-start gap-2 text-sm text-secondary-foreground">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-medium tabular-nums">{total}</span> ditahan TITIP DONG dan baru
            diteruskan ke {order.jastiper.name} setelah{" "}
            {isBuyer ? "kamu terima barangnya" : "pembeli menerima barang"}.
          </span>
        </p>
      );
    case "released":
      return (
        <p className="flex max-w-md items-start gap-2 text-sm text-secondary-foreground">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          Barang sudah diterima dan dana sudah diteruskan ke {order.jastiper.name}, dipotong biaya
          layanan 5%.
        </p>
      );
    case "refunded":
      return <p className="text-sm">Dana {total} dikembalikan ke pembeli.</p>;
    default:
      return null;
  }
}
