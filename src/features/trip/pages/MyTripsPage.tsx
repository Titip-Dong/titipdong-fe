import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  getListMyTripsQueryKey,
  getListTripsQueryKey,
  useCloseTrip,
  useCancelTrip,
  useListMyTrips,
} from "@/api/generated/endpoints/trip/trip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api-error";
import { TripRow } from "../components/TripRow";

export function Component() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useListMyTrips({ limit: 100 });
  const closeTrip = useCloseTrip({
    mutation: {
      onSuccess: () => {
        toast.success("Trip ditutup. Pembeli tidak bisa titip lagi di trip ini.");
        void queryClient.invalidateQueries({ queryKey: getListMyTripsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      },
      onError: (err) => toast.error(errorMessage(err, { 409: "Trip ini sudah ditutup." })),
    },
  });
  const cancelTrip = useCancelTrip({
    mutation: {
      onSuccess: async () => {
        toast.success("Trip dibatalkan.");
        await queryClient.invalidateQueries();
      },
      onError: () =>
        toast.error("Trip gagal dibatalkan. Selesaikan dulu titipan aktif di trip ini."),
    },
  });
  const trips = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold">Trip saya</h1>
        <Button asChild>
          <Link to="/my-trips/new">
            <PlusIcon data-icon="inline-start" />
            Buka trip baru
          </Link>
        </Button>
      </header>

      {isPending ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : isError ? (
        <p className="text-destructive">Trip kamu gagal dimuat. Muat ulang halaman, ya.</p>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
          Kamu belum punya trip. Mau jalan-jalan ke mana? Buka trip supaya orang bisa titip barang.
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {trips.map((t) => (
            <li key={t.id} className="sm:flex sm:items-center">
              <div className="min-w-0 flex-1">
                <TripRow trip={t} to={`/my-trips/${t.id}/requests`} />
              </div>
              {t.status === "open" && (
                <div className="px-4 pb-4 sm:p-5 sm:pl-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={closeTrip.isPending}
                    onClick={() => {
                      if (
                        window.confirm(`Tutup trip "${t.title}"? Pembeli tidak bisa titip lagi.`)
                      ) {
                        closeTrip.mutate({ id: t.id });
                      }
                    }}
                  >
                    Tutup trip
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2 px-4 pb-4 sm:pb-5">
                {t.status === "open" && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/my-trips/${t.id}/edit`}>Edit trip</Link>
                  </Button>
                )}
                {(t.status === "open" || t.status === "closed") && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/my-trips/${t.id}/catalog`}>Kelola katalog</Link>
                  </Button>
                )}
                {(t.status === "open" || t.status === "closed") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={cancelTrip.isPending}
                    onClick={() => {
                      if (window.confirm(`Batalkan trip "${t.title}"?`))
                        cancelTrip.mutate({ id: t.id });
                    }}
                  >
                    Batalkan trip
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
