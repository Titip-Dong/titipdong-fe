import { useSearchParams } from "react-router";
import { LoadMore } from "@/components/LoadMore";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TripRow } from "../components/TripRow";
import { useOpenTrips } from "../hooks/useTrips";

export function Component() {
  const [params, setParams] = useSearchParams();
  const city = params.get("city") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const filtered = Boolean(city || from || to);
  const trips = useOpenTrips({
    city: city || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const applyFilters = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const next = new URLSearchParams();
    for (const key of ["city", "from", "to"]) {
      const value = String(data.get(key) ?? "").trim();
      if (value) next.set(key, value);
    }
    setParams(next);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-3xl sm:text-4xl">{city ? `Trip ke ${city}` : "Cari trip"}</h1>

      <form
        key={params.toString()}
        className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(e.currentTarget);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="city">Kota tujuan</Label>
          <Input id="city" name="city" defaultValue={city} placeholder="Misalnya Seoul" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="from">Berangkat dari</Label>
          <Input id="from" name="from" type="date" defaultValue={from} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="to">Sampai</Label>
          <Input id="to" name="to" type="date" defaultValue={to} />
        </div>
        <Button type="submit">Cari</Button>
      </form>

      {trips.isPending ? (
        <ListSkeleton rows={4} />
      ) : trips.isError ? (
        <ErrorState
          description="Daftar trip gagal dimuat. Cek tanggalnya, lalu coba lagi."
          onRetry={() => void trips.refetch()}
        />
      ) : trips.items.length === 0 ? (
        <EmptyState
          title={filtered ? "Belum ada trip yang cocok" : "Belum ada trip yang buka"}
          description={
            filtered ? "Coba kota lain atau longgarkan tanggalnya." : "Cek lagi nanti, ya."
          }
          action={filtered ? { label: "Hapus filter", onClick: () => setParams({}) } : undefined}
        />
      ) : (
        <div className="space-y-4">
          <ul className="divide-y rounded-xl border bg-card">
            {trips.items.map((t) => (
              <li key={t.id}>
                <TripRow trip={t} to={`/trip/${t.slug}`} />
              </li>
            ))}
          </ul>
          <LoadMore {...trips} />
        </div>
      )}
    </div>
  );
}
