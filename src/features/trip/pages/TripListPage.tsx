import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { LoadMore } from "@/components/LoadMore";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { TripRow } from "../components/TripRow";
import { useOpenTrips } from "../hooks/useTrips";

export function Component() {
  const [params, setParams] = useSearchParams();
  const city = params.get("city") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const [cityInput, setCityInput] = useState(city);
  const debouncedCity = useDebouncedValue(cityInput.trim());

  // Typing updates the URL once the user pauses; replace keeps the history clean.
  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedCity) next.set("city", debouncedCity);
        else next.delete("city");
        return next;
      },
      { replace: true },
    );
  }, [debouncedCity, setParams]);

  // The URL changed from outside (navbar link, "Hapus filter"): follow it.
  const [seenCity, setSeenCity] = useState(city);
  if (city !== seenCity) {
    setSeenCity(city);
    if (city !== debouncedCity) setCityInput(city);
  }

  const setDate = (key: "from" | "to", value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const filtered = Boolean(city || from || to);
  const trips = useOpenTrips({
    city: city || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-3xl sm:text-4xl">{city ? `Trip ke ${city}` : "Cari trip"}</h1>

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="grid gap-1.5">
          <Label htmlFor="city">Kota tujuan</Label>
          <Input
            id="city"
            type="search"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Misalnya Seoul"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="from">Berangkat dari</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setDate("from", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="to">Sampai</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setDate("to", e.target.value)} />
        </div>
      </div>

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
        <div>
          <ul className="grid gap-3">
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
