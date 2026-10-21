import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
  getListMyTripsQueryKey,
  getListTripsQueryKey,
  useCreateTrip,
} from "@/api/generated/endpoints/trip/trip";
import { CreateTripBody } from "@/api/generated/zod/trip/trip.zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";
import { countries } from "../countries";

// The form edits the deadline as a local date-time; it becomes an RFC 3339 timestamp on submit.
const TripForm = CreateTripBody.extend({
  destinationCountry: z.string().length(2, "Pilih negara tujuan."),
  requestDeadline: z.string().min(1, "Isi batas titip."),
}).refine((v) => v.returnsOn >= v.departsOn, {
  path: ["returnsOn"],
  message: "Tanggal pulang tidak boleh sebelum tanggal berangkat.",
});

type TripFormValues = z.infer<typeof TripForm>;

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm";

export function Component() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createTrip = useCreateTrip();
  const form = useForm<TripFormValues>({
    resolver: zodResolver(TripForm),
    defaultValues: {
      title: "",
      description: "",
      destinationCity: "",
      destinationCountry: "",
      departsOn: "",
      returnsOn: "",
      requestDeadline: "",
      capacity: 20,
    },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    createTrip.mutate(
      { data: { ...values, requestDeadline: new Date(values.requestDeadline).toISOString() } },
      {
        onSuccess: (trip) => {
          void queryClient.invalidateQueries({ queryKey: getListMyTripsQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
          toast.success("Trip kamu sudah buka. Bagikan link-nya ke calon pembeli!");
          navigate(`/trip/${trip.slug}`);
        },
      },
    ),
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Buka trip baru</h1>
        <p className="text-muted-foreground">
          Ceritakan ke mana kamu pergi dan sampai kapan pembeli bisa titip barang.
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate className="rounded-2xl border bg-card p-5 sm:p-6">
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Judul trip</FieldLabel>
            <Input
              id="title"
              placeholder="Contoh: Jastip Tokyo akhir Oktober"
              aria-invalid={!!errors.title}
              {...form.register("title")}
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.destinationCity}>
              <FieldLabel htmlFor="city">Kota tujuan</FieldLabel>
              <Input
                id="city"
                placeholder="Tokyo"
                aria-invalid={!!errors.destinationCity}
                {...form.register("destinationCity")}
              />
              <FieldError errors={[errors.destinationCity]} />
            </Field>
            <Field data-invalid={!!errors.destinationCountry}>
              <FieldLabel htmlFor="country">Negara</FieldLabel>
              <select
                id="country"
                className={selectClass}
                aria-invalid={!!errors.destinationCountry}
                {...form.register("destinationCountry")}
              >
                <option value="">Pilih negara</option>
                {Object.entries(countries).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <FieldError errors={[errors.destinationCountry]} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.departsOn}>
              <FieldLabel htmlFor="departsOn">Tanggal berangkat</FieldLabel>
              <Input
                id="departsOn"
                type="date"
                aria-invalid={!!errors.departsOn}
                {...form.register("departsOn")}
              />
              <FieldError errors={[errors.departsOn]} />
            </Field>
            <Field data-invalid={!!errors.returnsOn}>
              <FieldLabel htmlFor="returnsOn">Tanggal pulang</FieldLabel>
              <Input
                id="returnsOn"
                type="date"
                aria-invalid={!!errors.returnsOn}
                {...form.register("returnsOn")}
              />
              <FieldError errors={[errors.returnsOn]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.requestDeadline}>
            <FieldLabel htmlFor="requestDeadline">Batas titip</FieldLabel>
            <Input
              id="requestDeadline"
              type="datetime-local"
              aria-invalid={!!errors.requestDeadline}
              {...form.register("requestDeadline")}
            />
            <FieldDescription>Setelah waktu ini, pembeli tidak bisa titip lagi.</FieldDescription>
            <FieldError errors={[errors.requestDeadline]} />
          </Field>

          <Field data-invalid={!!errors.capacity} className="max-w-48">
            <FieldLabel htmlFor="capacity">Kapasitas barang</FieldLabel>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={1000}
              aria-invalid={!!errors.capacity}
              {...form.register("capacity", { valueAsNumber: true })}
            />
            <FieldDescription>
              Berapa barang yang bisa kamu bawa untuk seluruh titipan.
            </FieldDescription>
            <FieldError errors={[errors.capacity]} />
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Keterangan (opsional)</FieldLabel>
            <Textarea
              id="description"
              rows={4}
              placeholder="Barang apa saja yang bisa kamu bawa, toko yang akan kamu datangi, dan sebagainya."
              {...form.register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          {createTrip.isError && (
            <FieldError>
              {errorMessage(createTrip.error, {
                422: "Cek lagi tanggalnya: batas titip harus di masa depan dan tidak lewat dari tanggal pulang.",
              })}
            </FieldError>
          )}
          <Button type="submit" size="lg" disabled={createTrip.isPending}>
            {createTrip.isPending ? "Membuka trip..." : "Buka trip"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
