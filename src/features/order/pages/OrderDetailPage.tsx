import { useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import {
  getGetOrderQueryKey,
  getListOrdersQueryKey,
  useCancelOrder,
  useGetOrder,
} from "@/api/generated/endpoints/order/order";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ProductImage } from "@/components/ProductImage";
import { Receipt, ReceiptPerforation, ReceiptSection } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusCard } from "@/features/payment";
import { ShipmentPanel } from "@/features/shipment";
import { errorMessage } from "@/lib/api-error";
import { formatDate, formatRupiah } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import { DecisionPanel } from "../components/DecisionPanel";
import { Timeline } from "../components/Timeline";

export function Component() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isPending, error } = useGetOrder(id);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
    void queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
  };
  const cancel = useCancelOrder({
    mutation: {
      onSuccess: () => {
        toast.success("Titipan dibatalkan.");
        refresh();
      },
      onError: (err) =>
        toast.error(
          errorMessage(err, { 409: "Titipan yang sudah dibayar tidak bisa dibatalkan." }),
        ),
    },
  });

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }
  if (error || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
        <h1 className="text-3xl font-bold">
          {notFound ? "Titipan tidak ditemukan" : "Titipan gagal dimuat"}
        </h1>
        <Button variant="secondary" asChild>
          <Link to="/orders">Kembali ke daftar titipan</Link>
        </Button>
      </div>
    );
  }

  const { order, events } = data;
  const isBuyer = userId === order.buyer.id;
  const isJastiper = userId === order.jastiper.id;
  const canCancel = isBuyer && (order.status === "requested" || order.status === "approved");

  const below = (
    <>
      {isJastiper && order.status === "requested" && (
        <DecisionPanel orderId={order.id} quantity={order.quantity} onDone={refresh} />
      )}
      {isBuyer && order.status === "requested" && (
        <p className="text-sm">Menunggu {order.jastiper.name} menentukan harga titipanmu.</p>
      )}
      {(order.status === "rejected" || order.status === "cancelled") && (
        <p className="text-sm">
          {order.status === "rejected" ? "Ditolak jastiper" : "Titipan dibatalkan"}
          {order.statusReason && `: ${order.statusReason}`}
        </p>
      )}
      <PaymentStatusCard order={order} />
      <ShipmentPanel order={order} />
      {canCancel && (
        <Button
          variant="ghost"
          className="w-fit"
          disabled={cancel.isPending}
          onClick={() => {
            if (window.confirm("Batalkan titipan ini?")) cancel.mutate({ id: order.id });
          }}
        >
          Batalkan titipan
        </Button>
      )}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <header className="space-y-1">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
          {isJastiper ? "Titipan masuk" : "Titipan saya"}
        </Link>
        <h1 className="text-3xl font-bold">Nota titipan {order.code}</h1>
        <p className="text-sm text-muted-foreground">Dibuat {formatDate(order.createdAt)}</p>
      </header>

      <Receipt>
        <ReceiptSection className="space-y-5">
          <div className="flex items-start gap-4">
            <ProductImage name={order.productName} tone="rambu" className="size-20 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium">{order.productName}</p>
              <p className="text-sm text-muted-foreground">
                {order.quantity} barang, dari{" "}
                <Link to={`/trip/${order.trip.slug}`} className="hover:underline">
                  {order.trip.title}
                </Link>{" "}
                bersama {order.jastiper.name}
              </p>
              {isJastiper && (
                <p className="text-sm text-muted-foreground">Pembeli: {order.buyer.name}</p>
              )}
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          {(order.notes || order.productUrl) && (
            <div className="space-y-1 text-sm">
              {order.notes && <p className="whitespace-pre-line">{order.notes}</p>}
              {order.productUrl && (
                <a
                  href={order.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Lihat produk
                  <ExternalLinkIcon className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          )}
          {order.total !== undefined &&
            order.itemPrice !== undefined &&
            order.jastipFee !== undefined && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Harga barang per unit, {order.quantity} barang
                  </dt>
                  <dd className="tabular-nums">{formatRupiah(order.itemPrice)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Fee jastip</dt>
                  <dd className="tabular-nums">{formatRupiah(order.jastipFee)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatRupiah(order.total)}</dd>
                </div>
              </dl>
            )}
        </ReceiptSection>
        <ReceiptPerforation />
        <ReceiptSection className="flex flex-col gap-4 bg-secondary/60">{below}</ReceiptSection>
      </Receipt>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Riwayat</h2>
        <Timeline events={events} order={order} />
      </section>
    </div>
  );
}
