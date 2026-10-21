import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useCancelTrip, useListMyTrips, useUpdateTrip } from "@/api/generated/endpoints/trip/trip";
import type { TripResponse } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";

export function Component() {
  const { id = "" } = useParams();
  const trips = useListMyTrips({ limit: 100 });
  const trip = trips.data?.items.find((item) => item.id === id);
  if (trips.isPending)
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-80" />
      </main>
    );
  if (trips.isError || !trip)
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-destructive">Trip gagal dimuat atau bukan milikmu.</p>
        <Link to="/my-trips" className="text-primary">
          Kembali ke trip saya
        </Link>
      </main>
    );
  return <TripEditForm key={trip.id} trip={trip} />;
}

function toLocalInput(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function TripEditForm({ trip }: { trip: TripResponse }) {
  const { id = "" } = useParams();
  const client = useQueryClient();
  const navigate = useNavigate();
  const update = useUpdateTrip();
  const cancel = useCancelTrip();
  const [title, setTitle] = useState(trip.title);
  const [city, setCity] = useState(trip.destinationCity);
  const [country, setCountry] = useState(trip.destinationCountry);
  const [departsOn, setDepartsOn] = useState(trip.departsOn);
  const [returnsOn, setReturnsOn] = useState(trip.returnsOn);
  const [deadline, setDeadline] = useState(toLocalInput(trip.requestDeadline));
  const [description, setDescription] = useState(trip.description);
  const [capacity, setCapacity] = useState(trip.capacity);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await update.mutateAsync({
        id,
        data: {
          title: title.trim(),
          destinationCity: city.trim(),
          destinationCountry: country.toUpperCase(),
          departsOn,
          returnsOn,
          requestDeadline: new Date(deadline).toISOString(),
          description,
          capacity,
        },
      });
      await client.invalidateQueries();
      toast.success("Trip berhasil diperbarui.");
      navigate("/my-trips");
    } catch (error) {
      toast.error(
        errorMessage(error, {
          409: "Trip tidak bisa diedit atau kapasitasnya lebih kecil dari titipan yang sudah masuk.",
        }),
      );
    }
  }
  async function cancelTrip() {
    if (
      !window.confirm("Batalkan trip ini? Trip yang memiliki titipan aktif tidak bisa dibatalkan.")
    )
      return;
    try {
      await cancel.mutateAsync({ id });
      await client.invalidateQueries();
      toast.success("Trip dibatalkan.");
      navigate("/my-trips");
    } catch (error) {
      toast.error(
        errorMessage(error, {
          409: "Selesaikan atau tunggu semua titipan aktif sebelum membatalkan trip.",
        }),
      );
    }
  }
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Kelola trip</h1>
        <p className="mt-2 text-muted-foreground">Slug trip tetap sama meski judulnya diubah.</p>
      </header>
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-5">
        <Field>
          <FieldLabel htmlFor="title">Nama trip</FieldLabel>
          <Input
            id="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="city">Kota tujuan</FieldLabel>
            <Input
              id="city"
              required
              maxLength={100}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="country">Kode negara</FieldLabel>
            <Input
              id="country"
              required
              minLength={2}
              maxLength={2}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="departs">Berangkat</FieldLabel>
            <Input
              id="departs"
              type="date"
              required
              value={departsOn}
              onChange={(e) => setDepartsOn(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="returns">Pulang</FieldLabel>
            <Input
              id="returns"
              type="date"
              required
              value={returnsOn}
              onChange={(e) => setReturnsOn(e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="deadline">Batas titip</FieldLabel>
          <Input
            id="deadline"
            type="datetime-local"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="capacity">Kapasitas barang</FieldLabel>
          <Input
            id="capacity"
            type="number"
            min={trip.capacity - trip.remainingCapacity}
            max={1000}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
          <Textarea
            id="description"
            maxLength={2000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Button disabled={update.isPending}>
          {update.isPending ? "Menyimpan..." : "Simpan perubahan"}
        </Button>
      </form>
      {trip.status !== "completed" && trip.status !== "cancelled" && (
        <section className="rounded-xl border border-destructive/40 p-5">
          <h2 className="font-semibold">Batalkan trip</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tindakan ini hanya tersedia jika tidak ada titipan aktif.
          </p>
          <Button
            className="mt-3"
            variant="destructive"
            disabled={cancel.isPending}
            onClick={cancelTrip}
          >
            Batalkan trip
          </Button>
        </section>
      )}
    </main>
  );
}
