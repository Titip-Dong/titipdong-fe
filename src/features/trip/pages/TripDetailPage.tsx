import { CalendarIcon, ShieldCheckIcon } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import { ApiError } from "@/api/client";
import { useGetTrip } from "@/api/generated/endpoints/trip/trip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatRupiah } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import { countryName } from "../countries";

export function Component() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { data: trip, isPending, error } = useGetTrip(slug);

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }
  if (error || !trip) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-3xl font-bold">
          {notFound ? "Trip tidak ditemukan" : "Trip gagal dimuat"}
        </h1>
        <Button variant="secondary" asChild>
          <Link to="/trips">Cari trip lain</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === trip.jastiper.id;

  let action: React.ReactNode;
  if (isOwner) {
    action = (
      <Button asChild>
        <Link to={`/my-trips/${trip.id}/requests`}>Lihat titipan masuk</Link>
      </Button>
    );
  } else if (!trip.acceptsRequests) {
    action = <p className="text-muted-foreground">Trip ini sudah tidak menerima titipan.</p>;
  } else if (!user) {
    action = (
      <Button asChild>
        <Link to="/login" state={{ from: location }}>
          Masuk untuk titip
        </Link>
      </Button>
    );
  } else if (user.role === "buyer") {
    action = (
      <Button size="lg" asChild>
        <Link to={`/trip/${trip.slug}/request`}>Titip barang di trip ini</Link>
      </Button>
    );
  } else {
    action = <p className="text-muted-foreground">Masuk sebagai pembeli untuk titip barang.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {trip.destinationCity}, {countryName(trip.destinationCountry)}
        </p>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{trip.title}</h1>
        <p>
          Bersama <span className="font-medium">{trip.jastiper.name}</span>
        </p>
      </header>

      <dl className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2 sm:p-6">
        <div className="flex gap-3">
          <CalendarIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <dt className="text-sm text-muted-foreground">Jadwal perjalanan</dt>
            <dd className="font-medium">
              {formatDate(trip.departsOn)} sampai {formatDate(trip.returnsOn)}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <CalendarIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <dt className="text-sm text-muted-foreground">Batas titip</dt>
            <dd className="font-medium">{formatDateTime(trip.requestDeadline)}</dd>
          </div>
        </div>
      </dl>

      {trip.description && <p className="max-w-prose whitespace-pre-line">{trip.description}</p>}

      {trip.items.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Barang populer di trip ini</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Harga referensi bisa berubah. Harga final ditentukan jastiper saat menyetujui titipan.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {trip.items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border bg-card">
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="space-y-1 p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  {item.referencePrice !== undefined && (
                    <p className="pt-1 font-medium tabular-nums">
                      Mulai {formatRupiah(item.referencePrice)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-4 rounded-2xl bg-secondary/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex max-w-sm items-start gap-2 text-sm text-secondary-foreground">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          Harga final ditentukan jastiper setelah kamu titip. Pembayaranmu ditahan TITIP DONG sampai
          barang diterima.
        </p>
        {action}
      </div>
    </div>
  );
}
