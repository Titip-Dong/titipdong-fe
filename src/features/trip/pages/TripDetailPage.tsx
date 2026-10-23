import { Link, useLocation, useParams } from "react-router";
import { ApiError } from "@/api/client";
import { useGetTrip } from "@/api/generated/endpoints/trip/trip";
import { ActionBar } from "@/components/ActionBar";
import { Deadline } from "@/components/Deadline";
import { EscrowNote } from "@/components/EscrowNote";
import { EmptyState, ErrorState } from "@/components/PageState";
import { ProductTile } from "@/components/ProductTile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import { TripStatusBadge } from "../components/TripStatusBadge";
import { countryName } from "../countries";

const tones = ["rambu", "paspor", "netral"] as const;

export function Component() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { data: trip, isPending, error, refetch } = useGetTrip(slug);

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10" aria-busy>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  if (error || !trip) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        {notFound ? (
          <EmptyState
            title="Trip ini nggak ketemu"
            description="Mungkin link-nya salah atau trip-nya sudah dihapus."
            action={{ label: "Cari trip lain", to: "/trips" }}
          />
        ) : (
          <ErrorState onRetry={() => void refetch()} />
        )}
      </div>
    );
  }

  const isOwner = user?.id === trip.jastiper.id;

  let action: React.ReactNode;
  if (isOwner) {
    action = (
      <Button asChild>
        <Link to={`/my-trips/${trip.slug}`}>Kelola trip</Link>
      </Button>
    );
  } else if (!trip.acceptsRequests) {
    action = (
      <p className="text-sm text-muted-foreground">Trip ini sudah tidak menerima titipan.</p>
    );
  } else if (!user) {
    action = (
      <Button size="lg" asChild>
        <Link to="/login" state={{ from: location }}>
          Masuk untuk titip
        </Link>
      </Button>
    );
  } else if (user.role === "buyer") {
    action = (
      <Button size="lg" asChild>
        <Link to={`/trip/${trip.slug}/request`}>Titip barang</Link>
      </Button>
    );
  } else {
    action = (
      <p className="text-sm text-muted-foreground">Masuk sebagai pembeli untuk titip barang.</p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
          {trip.destinationCity}, {countryName(trip.destinationCountry)}
          {trip.status !== "open" && <TripStatusBadge value={trip.status} />}
        </div>
        <h1 className="text-3xl sm:text-4xl">{trip.title}</h1>
        <p className="text-muted-foreground">
          {trip.jastiper.name}, {formatDate(trip.departsOn)} sampai {formatDate(trip.returnsOn)}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {trip.acceptsRequests && <Deadline label="Titip sebelum" at={trip.requestDeadline} />}
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          Sisa kapasitas{" "}
          <span className="font-semibold tabular-nums">{trip.remainingCapacity}</span> dari{" "}
          {trip.capacity} barang
        </p>
      </div>

      {trip.description && <p className="max-w-prose whitespace-pre-line">{trip.description}</p>}

      <div className="space-y-3">
        <EscrowNote>
          Harga final ditentukan {trip.jastiper.name} setelah kamu titip. Pembayaranmu ditahan TITIP
          DONG sampai barang kamu terima.
        </EscrowNote>
        <ActionBar>{action}</ActionBar>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl">Katalog</h2>
        {trip.items.length === 0 ? (
          <EmptyState
            title="Katalog belum diisi"
            description="Kamu tetap bisa titip barang lain yang kamu mau dari kota ini."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {trip.items.map((item, i) => (
              <li key={item.id}>
                <ProductTile
                  name={item.name}
                  city={trip.destinationCity}
                  estimatedPrice={item.referencePrice}
                  imageUrl={item.photoUrl}
                  tone={tones[i % tones.length]}
                />
                {trip.acceptsRequests && user?.role === "buyer" && (
                  <Link
                    className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    to={`/trip/${trip.slug}/request?item=${encodeURIComponent(item.name)}`}
                  >
                    Titip barang ini
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
