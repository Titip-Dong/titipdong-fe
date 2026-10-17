import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateTripItem, useUpdateTripItem } from "@/api/generated/endpoints/trip/trip";
import type { ItemResponse } from "@/api/generated/model";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, setFieldErrors } from "@/lib/api-error";
import { useInvalidateTrip } from "../hooks/useTrips";

const ItemForm = z.object({
  name: z.string().trim().min(1, "Isi nama barang.").max(120),
  referencePrice: z.string().trim().regex(/^\d*$/, "Isi angka saja, tanpa titik."),
  description: z.string().max(1000),
});

type ItemFormValues = z.infer<typeof ItemForm>;

/** Add or edit a catalog item in a side sheet: name, indicative price, notes, and a photo. */
export function CatalogItemSheet({
  tripId,
  slug,
  item,
  trigger,
}: {
  tripId: string;
  slug: string;
  item?: ItemResponse;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [photoUploadId, setPhotoUploadId] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const invalidateTrip = useInvalidateTrip();
  const create = useCreateTripItem();
  const update = useUpdateTripItem();
  const mutation = item ? update : create;
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(ItemForm),
    defaultValues: {
      name: item?.name ?? "",
      referencePrice: item?.referencePrice?.toString() ?? "",
      description: item?.description ?? "",
    },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit(async (values) => {
    const data = {
      name: values.name,
      description: values.description,
      referencePrice: values.referencePrice ? Number(values.referencePrice) : undefined,
      photoUploadId,
    };
    try {
      if (item) await update.mutateAsync({ id: tripId, itemId: item.id, data });
      else await create.mutateAsync({ id: tripId, data });
      await invalidateTrip(slug);
      toast.success(item ? "Barang disimpan." : "Barang ditambahkan ke katalog.");
      setOpen(false);
      if (!item) {
        form.reset();
        setPhotoUploadId(undefined);
      }
    } catch (err) {
      setFieldErrors(err, form.setError);
    }
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>{item ? "Ubah barang" : "Tambah barang"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} noValidate className="p-4">
          <FieldGroup>
            <ImageUploadField
              label="Foto (opsional)"
              purpose="trip_item_photo"
              initialUrl={item?.photoUrl}
              onChange={setPhotoUploadId}
              onBusyChange={setUploading}
            />
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="item-name">Nama barang</FieldLabel>
              <Input
                id="item-name"
                placeholder="Contoh: Tokyo Banana isi 8"
                aria-invalid={!!errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.referencePrice}>
              <FieldLabel htmlFor="item-price">Harga perkiraan (opsional)</FieldLabel>
              <Input
                id="item-price"
                inputMode="numeric"
                placeholder="145000"
                aria-invalid={!!errors.referencePrice}
                {...form.register("referencePrice")}
              />
              <FieldDescription>
                Harga final kamu tentukan saat menyetujui titipan.
              </FieldDescription>
              <FieldError errors={[errors.referencePrice]} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="item-description">Keterangan (opsional)</FieldLabel>
              <Textarea id="item-description" rows={3} {...form.register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>
            {mutation.isError && (
              <FieldError>
                {errorMessage(mutation.error, {
                  409: "Katalog trip ini sudah tidak bisa diubah.",
                  422: "Cek lagi isiannya. Satu trip maksimal 50 barang.",
                })}
              </FieldError>
            )}
            <Button type="submit" disabled={mutation.isPending || uploading}>
              {mutation.isPending ? "Menyimpan..." : item ? "Simpan barang" : "Tambah ke katalog"}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  );
}
