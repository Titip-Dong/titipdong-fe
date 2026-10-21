import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import {
  getListMyTripsQueryKey,
  getListTripItemsQueryKey,
  useCreateTripItem,
  useDeleteTripItem,
  useListMyTrips,
  useListTripItems,
  useUpdateTripItem,
} from "@/api/generated/endpoints/trip/trip";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/features/upload";
import { formatRupiah } from "@/lib/format";

export function Component() {
  const { id = "" } = useParams();
  const client = useQueryClient();
  const trips = useListMyTrips({ limit: 100 });
  const trip = trips.data?.items.find((item) => item.id === id);
  const items = useListTripItems(id);
  const create = useCreateTripItem();
  const update = useUpdateTripItem();
  const remove = useDeleteTripItem();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<File>();
  const [busy, setBusy] = useState(false);
  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const photoUploadId = photo ? await uploadImage(photo, "trip_item_photo") : undefined;
      await create.mutateAsync({
        id,
        data: {
          name: name.trim(),
          description: description.trim(),
          referencePrice: price ? Number(price) : undefined,
          photoUploadId,
        },
      });
      setName("");
      setDescription("");
      setPrice("");
      setPhoto(undefined);
      await client.invalidateQueries({ queryKey: getListTripItemsQueryKey(id) });
      await client.invalidateQueries({ queryKey: getListMyTripsQueryKey() });
      toast.success("Barang ditambahkan ke katalog.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Barang gagal ditambahkan.");
    } finally {
      setBusy(false);
    }
  }
  async function edit(
    itemId: string,
    current: { name: string; description?: string; referencePrice?: number },
  ) {
    const nextName = window.prompt("Nama barang", current.name);
    if (!nextName?.trim()) return;
    const nextPrice = window.prompt(
      "Harga referensi (rupiah, opsional)",
      current.referencePrice?.toString() ?? "",
    );
    if (nextPrice === null) return;
    const nextDescription = window.prompt("Deskripsi (opsional)", current.description ?? "");
    if (nextDescription === null) return;
    try {
      await update.mutateAsync({
        id,
        itemId,
        data: {
          name: nextName.trim(),
          description: nextDescription,
          referencePrice: nextPrice ? Number(nextPrice) : undefined,
        },
      });
      await client.invalidateQueries();
      toast.success("Barang katalog diperbarui.");
    } catch {
      toast.error("Barang katalog gagal diperbarui.");
    }
  }
  async function del(itemId: string, itemName: string) {
    if (!window.confirm(`Hapus ${itemName} dari katalog?`)) return;
    try {
      await remove.mutateAsync({ id, itemId });
      await client.invalidateQueries();
      toast.success("Barang dihapus.");
    } catch {
      toast.error("Barang gagal dihapus.");
    }
  }
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header>
        <Link to="/my-trips" className="text-sm text-primary hover:underline">
          Trip saya
        </Link>
        <h1 className="mt-2 text-4xl font-bold">Katalog trip</h1>
        <p className="mt-2 text-muted-foreground">
          {trip?.title ?? "Kelola barang populer yang bisa dititipkan."}
        </p>
      </header>
      {trips.isPending || items.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : trips.isError || !trip || items.isError ? (
        <p className="text-destructive">Katalog gagal dimuat.</p>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.data.items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border bg-card">
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="space-y-2 p-4">
                  <h2 className="font-semibold">{item.name}</h2>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  {item.referencePrice !== undefined && (
                    <p className="font-medium tabular-nums">{formatRupiah(item.referencePrice)}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => void edit(item.id, item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => void del(item.id, item.name)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {items.data.items.length >= 50 ? (
            <p className="text-sm text-muted-foreground">Katalog sudah mencapai batas 50 barang.</p>
          ) : (
            <form onSubmit={add} className="space-y-4 rounded-xl border bg-card p-5">
              <h2 className="text-xl font-bold">Tambah barang</h2>
              <Field>
                <FieldLabel htmlFor="itemName">Nama barang</FieldLabel>
                <Input
                  id="itemName"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="itemDescription">Deskripsi</FieldLabel>
                <Textarea
                  id="itemDescription"
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="itemPrice">Harga referensi (opsional)</FieldLabel>
                <Input
                  id="itemPrice"
                  type="number"
                  min={0}
                  max={1000000000}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="itemPhoto">Foto barang</FieldLabel>
                <Input
                  id="itemPhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setPhoto(e.target.files?.[0])}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP · maksimal 5 MB.</p>
              </Field>
              <Button disabled={busy || create.isPending}>
                {busy ? "Mengunggah..." : "Tambahkan ke katalog"}
              </Button>
            </form>
          )}
        </>
      )}
    </main>
  );
}
