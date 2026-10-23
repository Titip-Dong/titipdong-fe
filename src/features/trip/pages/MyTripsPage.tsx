import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import { LoadMore } from "@/components/LoadMore";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { TripRow } from "../components/TripRow";
import { TripStatusBadge } from "../components/TripStatusBadge";
import { useMyTrips } from "../hooks/useTrips";

export function Component() {
  const trips = useMyTrips();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl">Trip saya</h1>
        <Button asChild>
          <Link to="/my-trips/new">
            <PlusIcon data-icon="inline-start" />
            Buka trip baru
          </Link>
        </Button>
      </div>

      {trips.isPending ? (
        <ListSkeleton rows={3} />
      ) : trips.isError ? (
        <ErrorState onRetry={() => void trips.refetch()} />
      ) : trips.items.length === 0 ? (
        <EmptyState
          title="Belum ada trip"
          description="Buka trip saat kamu mau bepergian, lalu isi katalog barang yang bisa dititip."
          action={{ label: "Buka trip baru", to: "/my-trips/new" }}
        />
      ) : (
        <div className="space-y-4">
          <ul className="grid gap-3">
            {trips.items.map((t) => (
              <li key={t.id}>
                <TripRow
                  trip={t}
                  to={`/my-trips/${t.slug}`}
                  status={
                    <span className="flex flex-wrap items-center gap-2">
                      <TripStatusBadge value={t.status} />
                      <span className="text-muted-foreground">
                        {t.capacity - t.remainingCapacity} dari {t.capacity} barang terpesan
                      </span>
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
          <LoadMore {...trips} />
        </div>
      )}
    </div>
  );
}
