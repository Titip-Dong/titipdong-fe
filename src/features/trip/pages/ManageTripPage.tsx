import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import {
  useCancelTrip,
  useCloseTrip,
  useDeleteTripItem,
  useGetTrip,
} from "@/api/generated/endpoints/trip/trip";
import type { TripDetailResponse } from "@/api/generated/model";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Deadline } from "@/components/Deadline";
import { EmptyState, ErrorState } from "@/components/PageState";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api-error";
import { formatDate, formatRupiah } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import { CatalogItemSheet } from "../components/CatalogItemSheet";
import { TripStatusBadge } from "../components/TripStatusBadge";
import { countryName } from "../countries";
import { useInvalidateTrip } from "../hooks/useTrips";

const MAX_ITEMS = 50;

function TripActions({ trip }: { trip: TripDetailResponse }) {
  const invalidateTrip = useInvalidateTrip();
  const close = useCloseTrip();
  const cancel = useCancelTrip();

  const run = async (action: () => Promise<unknown>, done: string, conflict: string) => {
    try {
      await action();
      toast.success(done);
    } catch (err) {
      toast.error(errorMessage(err, { 409: conflict }));
      throw err;
    } finally {
      await invalidateTrip(trip.slug);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" asChild>
        <Link to={`/trip/${trip.slug}`}>Lihat halaman trip</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to={`/my-trips/${trip.id}/requests`}>Titipan masuk</Link>
      </Button>
      {trip.status === "open" && (
        <Button variant="outline" asChild>
          <Link to={`/my-trips/${trip.slug}/edit`}>Ubah trip</Link>
        </Button>
      )}
      {trip.status === "open" && (
        <ConfirmDialog
          trigger={<Button variant="secondary">Tutup trip</Button>}
          title="Tutup trip ini?"
          description="Pembeli tidak bisa titip lagi. Titipan yang sudah masuk tetap kamu proses."
          confirmLabel="Tutup trip"
          onConfirm={() =>
            run(
              () => close.mutateAsync({ id: trip.id }),
              "Trip ditutup.",
              "Trip ini sudah ditutup.",
            )
          }
        />
      )}
      {(trip.status === "open" || trip.status === "closed") && (
        <ConfirmDialog
          trigger={<Button variant="destructive">Batalkan trip</Button>}
          title="Batalkan trip ini?"
          description="Trip yang dibatalkan hilang dari pencarian dan tidak bisa dibuka lagi."
          confirmLabel="Batalkan trip"
          destructive
          onConfirm={() =>
            run(
              () => cancel.mutateAsync({ id: trip.id }),
              "Trip dibatalkan.",
              "Masih ada titipan yang berjalan. Selesaikan dulu sebelum membatalkan trip.",
            )
          }
        />
      )}
    </div>
  );
}

function Catalog({ trip }: { trip: TripDetailResponse }) {
  const invalidateTrip = useInvalidateTrip();
  const remove = useDeleteTripItem();
  const editable = trip.status === "open" || trip.status === "closed";
  const full = trip.items.length >= MAX_ITEMS;

  const addButton = (
    <Button disabled={full}>
      <PlusIcon data-icon="inline-start" />
      Tambah barang
    </Button>
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl">
          Katalog <span className="text-muted-foreground tabular-nums">{trip.items.length}</span>
        </h2>
        {editable && trip.items.length > 0 && (
          <CatalogItemSheet tripId={trip.id} slug={trip.slug} trigger={addButton} />
        )}
      </div>

      {trip.items.length === 0 ? (
        <EmptyState
          title="Katalog masih kosong"
          description="Tambahkan barang yang sering dititip supaya pembeli langsung tahu apa yang bisa kamu bawa."
        />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {trip.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <ProductImage
                src={item.photoUrl}
                name={item.name}
                className="size-16 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {item.referencePrice !== undefined
                    ? `Sekitar ${formatRupiah(item.referencePrice)}`
                    : "Tanpa harga perkiraan"}
                </p>
              </div>
              {editable && (
                <div className="flex shrink-0 gap-1">
                  <CatalogItemSheet
                    tripId={trip.id}
                    slug={trip.slug}
                    item={item}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${item.name}`}>
                        <PencilIcon />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${item.name}`}>
                        <Trash2Icon />
                      </Button>
                    }
                    title={`Hapus ${item.name}?`}
                    description="Barang ini hilang dari katalog. Titipan yang sudah masuk tidak terpengaruh."
                    confirmLabel="Hapus barang"
                    destructive
                    onConfirm={async () => {
                      try {
                        await remove.mutateAsync({ id: trip.id, itemId: item.id });
                        toast.success("Barang dihapus.");
                      } catch (err) {
                        toast.error(errorMessage(err));
                        throw err;
                      } finally {
                        await invalidateTrip(trip.slug);
                      }
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {editable && trip.items.length === 0 && (
        <CatalogItemSheet tripId={trip.id} slug={trip.slug} trigger={addButton} />
      )}
      {full && (
        <p className="text-sm text-muted-foreground">Katalog sudah penuh (maksimal 50 barang).</p>
      )}
    </section>
  );
}

export function Component() {
  const { slug = "" } = useParams();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: trip, isPending, isError, refetch } = useGetTrip(slug);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      {isPending ? (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : trip.jastiper.id !== userId ? (
        <EmptyState
          title="Trip ini nggak ketemu"
          description="Kamu cuma bisa mengelola trip milikmu sendiri."
          action={{ label: "Ke trip saya", to: "/my-trips" }}
        />
      ) : (
        <>
          <header className="space-y-3">
            <Link to="/my-trips" className="text-sm text-muted-foreground hover:text-foreground">
              Trip saya
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl">{trip.title}</h1>
              <TripStatusBadge value={trip.status} />
            </div>
            <p className="text-muted-foreground">
              {trip.destinationCity}, {countryName(trip.destinationCountry)}.{" "}
              {formatDate(trip.departsOn)} sampai {formatDate(trip.returnsOn)}
            </p>
            <TripActions trip={trip} />
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            {trip.status === "open" && <Deadline label="Batas titip" at={trip.requestDeadline} />}
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              <span className="font-semibold tabular-nums">
                {trip.capacity - trip.remainingCapacity}
              </span>{" "}
              dari {trip.capacity} barang sudah terpesan
            </p>
          </div>

          <Catalog trip={trip} />
        </>
      )}
    </div>
  );
}
