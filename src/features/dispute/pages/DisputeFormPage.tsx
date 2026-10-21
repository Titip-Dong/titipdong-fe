import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useGetOrder, getGetOrderQueryKey } from "@/api/generated/endpoints/order/order";
import { useOpenDispute } from "@/api/generated/endpoints/dispute/dispute";
import type { OpenDisputeRequestCategory } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/features/upload";
import { errorMessage } from "@/lib/api-error";

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
  const { data } = useGetOrder(id);
  const [category, setCategory] = useState<OpenDisputeRequestCategory>("not_received");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const open = useOpenDispute();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (description.trim().length < 1 || description.length > 2000) return;
    setBusy(true);
    try {
      const evidence = await Promise.all(
        files.map(async (file) => ({ uploadId: await uploadImage(file, "dispute_evidence") })),
      );
      await open.mutateAsync({ id, data: { category, description: description.trim(), evidence } });
      await client.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
      toast.success("Sengketa terkirim. Admin akan meninjau bukti dan informasimu.");
      navigate(`/orders/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (!data || data.order.status !== "shipped") {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-3xl font-bold">Sengketa tidak tersedia</h1>
        <p className="mt-3 text-muted-foreground">
          Sengketa hanya bisa diajukan untuk titipan yang sedang dikirim.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Ajukan sengketa</h1>
        <p className="mt-2 text-muted-foreground">
          Titipan {data.order.code}. Jelaskan masalahnya dan lampirkan foto bila ada.
        </p>
      </header>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
        <Field>
          <FieldLabel htmlFor="category">Jenis masalah</FieldLabel>
          <select
            id="category"
            className="h-10 rounded-md border bg-background px-3"
            value={category}
            onChange={(e) => setCategory(e.target.value as OpenDisputeRequestCategory)}
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Ceritakan masalahnya</FieldLabel>
          <Textarea
            id="description"
            maxLength={2000}
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{description.length}/2000 karakter</p>
        </Field>
        <Field>
          <FieldLabel htmlFor="evidence">Foto bukti (maksimal 5)</FieldLabel>
          <Input
            id="evidence"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, atau WebP; maksimal 5 MB per foto.
          </p>
          {files.length > 0 && (
            <ul className="text-sm">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              ))}
            </ul>
          )}
        </Field>
        <Button type="submit" disabled={busy || open.isPending || description.trim().length === 0}>
          {busy ? "Mengirim sengketa..." : "Kirim sengketa"}
        </Button>
      </form>
    </main>
  );
}
