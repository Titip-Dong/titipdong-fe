import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateTrip, useGetTrip, useUpdateTrip } from "@/api/generated/endpoints/trip/trip";
import type { TripDetailResponse } from "@/api/generated/model";
import { CreateTripBody } from "@/api/generated/zod/trip/trip.zod";
import { EmptyState, ErrorState } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, setFieldErrors } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth";
import { countries } from "../countries";
import { useInvalidateTrip } from "../hooks/useTrips";

// The deadline is edited as a local date-time and sent as an RFC 3339 timestamp.
const TripForm = CreateTripBody.extend({
  destinationCountry: z.string().length(2, "Pilih negara tujuan."),
  requestDeadline: z.string().min(1, "Isi batas titip."),
  capacity: z.coerce.number<string | number>().int().min(1, "Minimal 1 barang.").max(1000),
}).refine((v) => v.returnsOn >= v.departsOn, {
  path: ["returnsOn"],
  message: "Tanggal pulang tidak boleh sebelum tanggal berangkat.",
});

type TripFormValues = z.infer<typeof TripForm>;

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function TripFormFields({ trip }: { trip?: TripDetailResponse }) {
  const navigate = useNavigate();
  const invalidateTrip = useInvalidateTrip();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const mutation = trip ? updateTrip : createTrip;
  const form = useForm<z.input<typeof TripForm>, unknown, TripFormValues>({
    resolver: zodResolver(TripForm),
    defaultValues: trip
      ? {
          title: trip.title,
          description: trip.description,
          destinationCity: trip.destinationCity,
          destinationCountry: trip.destinationCountry,
          departsOn: trip.departsOn,
          returnsOn: trip.returnsOn,
          requestDeadline: toLocalInput(trip.requestDeadline),
          capacity: trip.capacity,
        }
      : {
          title: "",
          description: "",
          destinationCity: "",
          destinationCountry: "",
          departsOn: "",
          returnsOn: "",
          requestDeadline: "",
          capacity: 10,
        },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit(async (values) => {
    const data = { ...values, requestDeadline: new Date(values.requestDeadline).toISOString() };
    try {
      const saved = trip
        ? await updateTrip.mutateAsync({ id: trip.id, data })
        : await createTrip.mutateAsync({ data });
      await invalidateTrip(saved.slug);
      toast.success(trip ? "Trip disimpan." : "Trip sudah buka.");
      navigate(`/my-trips/${saved.slug}`);
    } catch (err) {
      setFieldErrors(err, form.setError);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
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

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.requestDeadline}>
            <FieldLabel htmlFor="requestDeadline">Batas titip</FieldLabel>
            <Input
              id="requestDeadline"
              type="datetime-local"
              aria-invalid={!!errors.requestDeadline}
              {...form.register("requestDeadline")}
            />
            <FieldDescription>Paling lambat hari pulang.</FieldDescription>
            <FieldError errors={[errors.requestDeadline]} />
          </Field>
          <Field data-invalid={!!errors.capacity}>
            <FieldLabel htmlFor="capacity">Kapasitas (barang)</FieldLabel>
            <Input
              id="capacity"
              type="number"
              inputMode="numeric"
              min={1}
              aria-invalid={!!errors.capacity}
              {...form.register("capacity")}
            />
            {trip && (
              <FieldDescription>
                Minimal {trip.capacity - trip.remainingCapacity}, sudah terpesan.
              </FieldDescription>
            )}
            <FieldError errors={[errors.capacity]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Keterangan (opsional)</FieldLabel>
          <Textarea
            id="description"
            rows={4}
            placeholder="Toko yang akan kamu datangi, barang yang nggak bisa kamu bawa, dan sebagainya."
            {...form.register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        {mutation.isError && (
          <FieldError>
            {errorMessage(mutation.error, {
              409: "Trip ini sudah tidak bisa diubah karena sudah ditutup.",
              422: "Cek lagi isiannya: batas titip harus di masa depan dan tidak lewat dari hari pulang.",
            })}
          </FieldError>
        )}
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : trip ? "Simpan trip" : "Buka trip"}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function Component() {
  const { slug } = useParams();
  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      {slug ? <EditTrip slug={slug} /> : <NewTrip />}
    </div>
  );
}

function NewTrip() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl">Buka trip baru</h1>
      <TripFormFields />
    </>
  );
}

function EditTrip({ slug }: { slug: string }) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: trip, isPending, isError, refetch } = useGetTrip(slug);

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (trip.jastiper.id !== userId) {
    return (
      <EmptyState
        title="Trip ini nggak ketemu"
        description="Kamu cuma bisa mengubah trip milikmu sendiri."
        action={{ label: "Ke trip saya", to: "/my-trips" }}
      />
    );
  }
  if (trip.status !== "open") {
    return (
      <EmptyState
        title="Trip ini sudah tidak bisa diubah"
        description="Hanya trip yang masih buka yang bisa diubah."
        action={{ label: "Kembali ke trip", to: `/my-trips/${trip.slug}` }}
      />
    );
  }
  return (
    <>
      <div className="space-y-1">
        <Link
          to={`/my-trips/${trip.slug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {trip.title}
        </Link>
        <h1 className="text-3xl sm:text-4xl">Ubah trip</h1>
      </div>
      <TripFormFields trip={trip} />
    </>
  );
}
