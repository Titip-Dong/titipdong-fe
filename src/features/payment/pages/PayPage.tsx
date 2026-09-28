import { useQueryClient } from "@tanstack/react-query";
import { FlaskConicalIcon, ShieldCheckIcon } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  getGetOrderQueryKey,
  getListOrdersQueryKey,
  useGetOrder,
} from "@/api/generated/endpoints/order/order";
import { useCheckoutOrder, useSimulatePayment } from "@/api/generated/endpoints/payment/payment";
import { Receipt, ReceiptPerforation, ReceiptSection } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime, formatRupiah } from "@/lib/format";

const payErrors = {
  404: "Titipan ini tidak ditemukan.",
  409: "Titipan ini tidak bisa dibayar lagi. Mungkin batas bayarnya sudah lewat atau sudah dibayar.",
};

export function Component() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isPending } = useGetOrder(id);
  const checkout = useCheckoutOrder();
  const simulate = useSimulatePayment();
  const paying = checkout.isPending || simulate.isPending;
  const error = checkout.error ?? simulate.error;

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }
  const order = data?.order;
  if (!order || order.status !== "approved" || order.total === undefined) {
    return <Navigate to={`/orders/${id}`} replace />;
  }

  // Fake gateway: create (or resume) the payment, then settle it right away.
  const pay = async () => {
    const payment = await checkout.mutateAsync({ id });
    await simulate.mutateAsync({ id: payment.id });
    await queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
    void queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    toast.success("Pembayaran berhasil. Uangmu aman ditahan TITIP DONG.");
    navigate(`/orders/${id}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-4xl font-bold">Pembayaran</h1>

      <Receipt>
        <ReceiptSection className="space-y-4">
          <div className="space-y-1">
            <p className="font-medium">{order.productName}</p>
            <p className="text-sm text-muted-foreground">
              {order.quantity} barang, {order.trip.title} bersama {order.jastiper.name}
            </p>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t pt-3">
            <span className="font-semibold">Total dibayar</span>
            <span className="text-2xl font-semibold tabular-nums">{formatRupiah(order.total)}</span>
          </div>
          {order.paymentDeadline && (
            <p className="text-sm text-muted-foreground">
              Bayar sebelum {formatDateTime(order.paymentDeadline)}.
            </p>
          )}
        </ReceiptSection>
        <ReceiptPerforation />
        <ReceiptSection className="space-y-4 bg-secondary/60">
          <p className="flex items-start gap-2 text-sm text-secondary-foreground">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            Uangmu ditahan TITIP DONG dan baru diteruskan ke {order.jastiper.name} setelah barang
            kamu terima.
          </p>
          <p className="flex items-start gap-2 rounded-lg bg-highlight-soft p-3 text-sm text-highlight-foreground">
            <FlaskConicalIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            Mode simulasi: belum terhubung ke payment gateway, jadi tidak ada uang sungguhan yang
            ditarik.
          </p>
          {error && <FieldError>{errorMessage(error, payErrors)}</FieldError>}
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => void pay().catch(() => undefined)} disabled={paying}>
              {paying ? "Memproses..." : `Bayar ${formatRupiah(order.total)}`}
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to={`/orders/${id}`}>Nanti saja</Link>
            </Button>
          </div>
        </ReceiptSection>
      </Receipt>
    </div>
  );
}
