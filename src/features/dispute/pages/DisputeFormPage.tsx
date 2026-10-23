import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useGetOrder, getGetOrderQueryKey } from "@/api/generated/endpoints/order/order";
import { useOpenDispute } from "@/api/generated/endpoints/dispute/dispute";
import type { OpenDisputeRequestCategory } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/api/client";
import { errorMessage } from "@/lib/api-error";
import { uploadImage } from "@/lib/upload";

const categories: { value: OpenDisputeRequestCategory; label: string }[] = [
  { value: "not_received", label: "Barang belum diterima" },
  { value: "not_as_described", label: "Barang tidak sesuai" },
  { value: "damaged", label: "Barang rusak" },
  { value: "other", label: "Masalah lainnya" },
];

export function Component() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const orderQuery = useGetOrder(id);
  const [category, setCategory] = useState<OpenDisputeRequestCategory>("not_received");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const open = useOpenDispute();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim() || files.length > 5) return;
    setBusy(true);
    try {
      const evidence = await Promise.all(
        files.map(async (file) => ({ uploadId: await uploadImage(file, "dispute_evidence") })),
      );
      await open.mutateAsync({
        id,
        data: {
          category,
          description: description.trim(),
          ...(evidence.length ? { evidence } : {}),
        },
      });
      await client.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
      toast.success("Sengketa terkirim. Admin akan meninjau informasi dan bukti kamu.");
      navigate(`/orders/${id}`);
    } catch (error) {
      toast.error(
        errorMessage(error, { 409: "Titipan sudah berubah dan tidak bisa disengketakan." }),
      );
    } finally {
      setBusy(false);
    }
  }

  if (orderQuery.isPending)
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <p>Memuat titipan...</p>
      </main>
    );
  if (orderQuery.error instanceof ApiError && orderQuery.error.status === 404)
    return (
      <main className="mx-auto max-w-xl space-y-4 px-4 py-10">
        <h1 className="text-3xl font-bold">Titipan tidak ditemukan</h1>
        <Link to="/orders">Kembali ke titipan</Link>
      </main>
    );
  const order = orderQuery.data?.order;
  if (!order || order.status !== "shipped") return <Navigate to={`/orders/${id}`} replace />;

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <header>
        <Link to={`/orders/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          Kembali ke titipan {order.code}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Ajukan sengketa</h1>
        <p className="mt-2 text-muted-foreground">
          Ceritakan masalahnya. Dana tetap ditahan selama admin meninjau.
        </p>
      </header>
      <form
        className="space-y-5 rounded-xl border bg-card p-5"
        onSubmit={(event) => void submit(event)}
      >
        <Field>
          <FieldLabel htmlFor="category">Masalah yang terjadi</FieldLabel>
          <select
            id="category"
            className="h-10 rounded-md border bg-background px-3"
            value={category}
            onChange={(event) => setCategory(event.target.value as OpenDisputeRequestCategory)}
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Ceritakan masalahnya</FieldLabel>
          <Textarea
            id="description"
            required
            minLength={1}
            maxLength={2000}
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">Maksimal 2.000 karakter.</p>
        </Field>
        <Field>
          <FieldLabel htmlFor="evidence">Foto bukti (opsional, maksimal 5)</FieldLabel>
          <input
            id="evidence"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
            className="block w-full text-sm"
          />
          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">{files.length} foto dipilih.</p>
          )}
          <p className="text-xs text-muted-foreground">
            JPG, PNG, atau WebP, maksimal 5 MB per foto.
          </p>
        </Field>
        {open.isError && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage(open.error, {
              409: "Titipan sudah berubah dan tidak bisa disengketakan.",
            })}
          </p>
        )}
        <Button disabled={!description.trim() || busy || open.isPending}>
          {busy ? "Mengirim bukti..." : open.isPending ? "Mengirim..." : "Kirim sengketa"}
        </Button>
      </form>
    </main>
  );
}
