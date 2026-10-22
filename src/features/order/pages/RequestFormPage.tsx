import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { getListOrdersQueryKey, useCreateOrder } from "@/api/generated/endpoints/order/order";
import { useGetTrip } from "@/api/generated/endpoints/trip/trip";
import { CreateOrderBody } from "@/api/generated/zod/order/order.zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";

// An empty product link is allowed in the form and dropped before sending.
const RequestForm = CreateOrderBody.extend({
  productUrl: z.union([z.literal(""), z.url("Link produk harus berupa URL, misalnya https://...")]),
});
type RequestFormValues = z.infer<typeof RequestForm>;

export function Component() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trip = useGetTrip(slug);
  const createOrder = useCreateOrder();
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(RequestForm),
    defaultValues: { productName: "", productUrl: "", quantity: 1, notes: "" },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit(({ productUrl, ...values }) =>
    createOrder.mutate(
      { slug, data: { ...values, productUrl: productUrl || undefined } },
      {
        onSuccess: (order) => {
          void queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast.success("Titipan terkirim. Tunggu jastiper menentukan harganya, ya.");
          navigate(`/orders/${order.id}`);
        },
      },
    ),
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Titip barang</h1>
        {trip.isPending ? (
          <Skeleton className="h-5 w-64" />
        ) : trip.data ? (
          <p className="text-muted-foreground">
            Di trip{" "}
            <Link to={`/trip/${slug}`} className="font-medium text-foreground hover:underline">
              {trip.data.title}
            </Link>{" "}
            bersama {trip.data.jastiper.name}. Titip sebelum{" "}
            {formatDateTime(trip.data.requestDeadline)}.
          </p>
        ) : null}
      </header>

      <form onSubmit={onSubmit} noValidate className="rounded-2xl border bg-card p-5 sm:p-6">
        <FieldGroup>
          <Field data-invalid={!!errors.productName}>
            <FieldLabel htmlFor="productName">Nama barang</FieldLabel>
            <Input
              id="productName"
              placeholder="Contoh: COSRX Snail Mucin 96 Essence 100 ml"
              aria-invalid={!!errors.productName}
              {...form.register("productName")}
            />
            <FieldError errors={[errors.productName]} />
          </Field>
          <Field data-invalid={!!errors.productUrl}>
            <FieldLabel htmlFor="productUrl">Link produk (opsional)</FieldLabel>
            <Input
              id="productUrl"
              type="url"
              placeholder="https://"
              aria-invalid={!!errors.productUrl}
              {...form.register("productUrl")}
            />
            <FieldDescription>Bantu jastiper menemukan barang yang tepat.</FieldDescription>
            <FieldError errors={[errors.productUrl]} />
          </Field>
          <Field data-invalid={!!errors.quantity} className="max-w-40">
            <FieldLabel htmlFor="quantity">Jumlah</FieldLabel>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={100}
              aria-invalid={!!errors.quantity}
              {...form.register("quantity", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.quantity]} />
          </Field>
          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="notes">Catatan (opsional)</FieldLabel>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Varian, ukuran, warna, atau toko yang kamu mau."
              {...form.register("notes")}
            />
            <FieldError errors={[errors.notes]} />
          </Field>
          <p className="text-sm text-muted-foreground">
            Kamu belum bayar sekarang. Jastiper akan menentukan harga barang dan fee-nya dulu.
          </p>
          {createOrder.isError && (
            <FieldError>
              {errorMessage(createOrder.error, {
                404: "Trip ini tidak ditemukan.",
                409: "Trip ini sudah tidak menerima titipan.",
              })}
            </FieldError>
          )}
          <Button type="submit" size="lg" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Mengirim..." : "Kirim titipan"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
