import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Titi } from "@/components/Titi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";
import { TripRow } from "../components/TripRow";
import { useOpenTrips } from "../hooks/useTrips";

const cities = ["Tokyo", "Seoul", "Bangkok", "Singapura", "Osaka"];

export function Component() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const isJastiper = useAuthStore((s) => s.hasRole("jastiper"));
  const trips = useOpenTrips({ limit: 5 });

  const search = (city: string) =>
    navigate(city ? `/trips?city=${encodeURIComponent(city)}` : "/trips");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl leading-[1.05] sm:text-5xl">Mau nitip apa dari luar negeri?</h1>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              search(query.trim());
            }}
          >
            <Label htmlFor="hero-search" className="sr-only">
              Kota tujuan
            </Label>
            <Input
              id="hero-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kota tujuan, misalnya Tokyo"
              className="h-12 px-4"
            />
            <Button size="lg" type="submit">
              <SearchIcon data-icon="inline-start" />
              Cari
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <Button key={c} variant="outline" size="sm" asChild>
                <Link to={`/trips?city=${encodeURIComponent(c)}`}>{c}</Link>
              </Button>
            ))}
          </div>
        </div>
        <Titi pose="menyapa" decorative className="mx-auto hidden size-56 md:block" />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl sm:text-2xl">Trip yang masih buka</h2>
          <Button variant="secondary" size="sm" asChild>
            <Link to="/trips">Lihat semua</Link>
          </Button>
        </div>
        {trips.isPending ? (
          <ListSkeleton />
        ) : trips.isError ? (
          <ErrorState onRetry={() => void trips.refetch()} />
        ) : trips.items.length === 0 ? (
          <EmptyState
            title="Belum ada trip yang buka"
            description={
              isJastiper
                ? "Buka trip pertamamu supaya orang bisa mulai titip."
                : "Cek lagi nanti, ya."
            }
            action={isJastiper ? { label: "Buka trip", to: "/my-trips/new" } : undefined}
          />
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {trips.items.map((t) => (
              <li key={t.id}>
                <TripRow trip={t} to={`/trip/${t.slug}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
