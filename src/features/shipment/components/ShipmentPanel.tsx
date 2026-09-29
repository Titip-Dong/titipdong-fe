import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { PackageCheckIcon, TruckIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getGetOrderQueryKey, getListOrdersQueryKey } from "@/api/generated/endpoints/order/order";
import { getGetWalletQueryKey } from "@/api/generated/endpoints/payment/payment";
import {
  getGetShipmentQueryKey,
  useConfirmReceipt,
  useGetShipment,
  useShipOrder,
} from "@/api/generated/endpoints/shipment/shipment";
import type { OrderResponse } from "@/api/generated/model";
import { ShipOrderBody } from "@/api/generated/zod/shipment/shipment.zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

const couriers: Record<string, string> = {
  jne: "JNE",
  jnt: "J&T",
  sicepat: "SiCepat",
  anteraja: "AnterAja",
  pos: "Pos Indonesia",
  gosend: "GoSend",
  grabexpress: "GrabExpress",
};

const ShipForm = ShipOrderBody.refine(
  (v) => v.method === "cod" || (!!v.courierCode && !!v.trackingNumber?.trim()),
  { path: ["trackingNumber"], message: "Pilih kurir dan isi nomor resinya." },
);
type ShipFormValues = z.infer<typeof ShipForm>;

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

const shippedStatuses = new Set(["shipped", "delivered", "disputed", "released"]);

/** Handover and receipt confirmation. Embedded in the order detail page (F03). */
export function ShipmentPanel({ order }: { order: OrderResponse }) {
  const userId = useAuthStore((s) => s.user?.id);
  const isJastiper = userId === order.jastiper.id;
  const isBuyer = userId === order.buyer.id;

  if (order.status === "paid") {
    return isJastiper ? (
      <ShipOrderForm orderId={order.id} />
    ) : (
      <p className="flex items-start gap-2 text-sm">
        <TruckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Menunggu {order.jastiper.name} menyerahkan atau mengirim barangmu.
      </p>
    );
  }
  if (shippedStatuses.has(order.status)) {
    return <ShipmentDetails order={order} canConfirm={isBuyer && order.status === "shipped"} />;
  }
  return null;
}

function useInvalidateOrder(orderId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
    void queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetShipmentQueryKey(orderId) });
    void queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
  };
}

function ShipOrderForm({ orderId }: { orderId: string }) {
  const invalidate = useInvalidateOrder(orderId);
  const ship = useShipOrder({
    mutation: {
      onSuccess: () => {
        toast.success("Pengiriman dicatat. Pembeli sudah bisa melihat resinya.");
        invalidate();
      },
    },
  });
  const form = useForm<ShipFormValues>({
    resolver: zodResolver(ShipForm),
    defaultValues: { method: "courier", courierCode: "", trackingNumber: "", handoverNote: "" },
  });
  const method = useWatch({ control: form.control, name: "method" });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    ship.mutate({
      id: orderId,
      data: values.method === "cod" ? { method: "cod", handoverNote: values.handoverNote } : values,
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
      <p className="font-heading text-lg font-semibold">Kirim barang</p>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="method">Cara serah terima</FieldLabel>
          <select id="method" className={selectClass} {...form.register("method")}>
            <option value="courier">Kirim lewat kurir</option>
            <option value="cod">Ketemuan langsung (COD)</option>
          </select>
        </Field>
        {method === "courier" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="courierCode">Kurir</FieldLabel>
              <select id="courierCode" className={selectClass} {...form.register("courierCode")}>
                <option value="">Pilih kurir</option>
                {Object.entries(couriers).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <Field data-invalid={!!errors.trackingNumber}>
              <FieldLabel htmlFor="trackingNumber">Nomor resi</FieldLabel>
              <Input
                id="trackingNumber"
                aria-invalid={!!errors.trackingNumber}
                {...form.register("trackingNumber")}
              />
              <FieldError errors={[errors.trackingNumber]} />
            </Field>
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="handoverNote">Catatan untuk pembeli (opsional)</FieldLabel>
          <Textarea
            id="handoverNote"
            rows={2}
            placeholder={
              method === "cod" ? "Contoh: ketemu di stasiun Sudirman, Sabtu jam 10." : ""
            }
            {...form.register("handoverNote")}
          />
        </Field>
        {ship.isError && (
          <FieldError>
            {errorMessage(ship.error, { 409: "Titipan ini sudah dikirim atau belum dibayar." })}
          </FieldError>
        )}
        <Button type="submit" disabled={ship.isPending} className="w-fit">
          {ship.isPending ? "Menyimpan..." : "Tandai sudah dikirim"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function ShipmentDetails({ order, canConfirm }: { order: OrderResponse; canConfirm: boolean }) {
  const { data: shipment, isPending } = useGetShipment(order.id);
  const invalidate = useInvalidateOrder(order.id);
  const confirm = useConfirmReceipt({
    mutation: {
      onSuccess: () => {
        toast.success(`Terima kasih! Dana sudah diteruskan ke ${order.jastiper.name}.`);
        invalidate();
      },
      onError: (err) => toast.error(errorMessage(err, { 409: "Titipan ini sudah dikonfirmasi." })),
    },
  });

  if (isPending || !shipment) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-start gap-2 text-sm">
        <TruckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div className="space-y-0.5">
          {shipment.method === "cod" ? (
            <p className="font-medium">Diserahkan langsung (COD)</p>
          ) : (
            <p className="font-medium">
              {couriers[shipment.courierCode] ?? shipment.courierCode.toUpperCase()}, resi{" "}
              <span className="tabular-nums">{shipment.trackingNumber}</span>
            </p>
          )}
          <p className="text-muted-foreground">Dikirim {formatDateTime(shipment.shippedAt)}</p>
          {shipment.deliveredAt && (
            <p className="text-muted-foreground">Diterima {formatDateTime(shipment.deliveredAt)}</p>
          )}
          {shipment.handoverNote && <p>{shipment.handoverNote}</p>}
        </div>
      </div>
      {canConfirm && (
        <Button
          disabled={confirm.isPending}
          onClick={() => {
            if (
              window.confirm(
                "Barang sudah kamu terima dan sesuai? Dana akan langsung diteruskan ke jastiper.",
              )
            ) {
              confirm.mutate({ id: order.id });
            }
          }}
        >
          <PackageCheckIcon data-icon="inline-start" />
          Barang sudah diterima
        </Button>
      )}
    </div>
  );
}
