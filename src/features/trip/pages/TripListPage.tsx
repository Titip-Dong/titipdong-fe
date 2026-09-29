import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TripRow } from "../components/TripRow";
import { useOpenTrips } from "../hooks/useOpenTrips";

export function Component() {
  const [params, setParams] = useSearchParams();
  const city = params.get("city") ?? "";
  const [query, setQuery] = useState(city);
  const trips = useOpenTrips(city);
  const items = trips.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">{city ? `Trip ke ${city}` : "Cari trip"}</h1>
        <form
          className="flex max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setParams(query.trim() ? { city: query.trim() } : {});
          }}
        >
          <Label htmlFor="city-search" className="sr-only">
            Kota tujuan
          </Label>
          <Input
            id="city-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kota tujuan, misalnya Seoul"
          />
          <Button type="submit">
            <SearchIcon data-icon="inline-start" />
            Cari
          </Button>
        </form>
      </header>

      {trips.isPending ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : trips.isError ? (
        <p className="text-destructive">Daftar trip gagal dimuat. Muat ulang halaman, ya.</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
          {city
            ? `Belum ada trip ke ${city} yang masih buka. Coba kota lain.`
            : "Belum ada trip yang buka. Cek lagi nanti, ya."}
        </div>
      ) : (
        <>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {items.map((t) => (
              <li key={t.id}>
                <TripRow trip={t} to={`/trip/${t.slug}`} />
              </li>
            ))}
          </ul>
          {trips.hasNextPage && (
            <Button
              variant="outline"
              onClick={() => trips.fetchNextPage()}
              disabled={trips.isFetchingNextPage}
            >
              {trips.isFetchingNextPage ? "Memuat..." : "Muat trip lainnya"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
