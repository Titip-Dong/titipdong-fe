import { SearchIcon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { TripRow } from "../components/TripRow";
import { useOpenTrips } from "../hooks/useOpenTrips";

const cities = ["Tokyo", "Seoul", "Bangkok", "Singapura", "Osaka"];

// Decorative only; real products come from each trip.
const heroItems = [
  { name: "Snail Mucin 96", city: "Seoul", className: "-rotate-3" },
  { name: "Tokyo Banana", city: "Tokyo", className: "mt-6 rotate-2" },
  { name: "Thai Tea Cha Tra Mue", city: "Bangkok", className: "hidden sm:block rotate-1" },
  { name: "Pocky Matcha", city: "Kyoto", className: "hidden sm:block mt-6 -rotate-2" },
];

const steps = [
  {
    title: "Pilih trip",
    body: "Cari jastiper yang lagi ke kota tujuan barang incaranmu.",
  },
  {
    title: "Titip dan bayar",
    body: "Jastiper menentukan harga, kamu bayar ke TITIP DONG. Uangnya kami tahan dulu.",
  },
  {
    title: "Terima barang",
    body: "Setelah kamu konfirmasi barang sampai, baru uangnya diteruskan ke jastiper.",
  },
];

export function Component() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const isJastiper = useAuthStore((s) => s.hasRole("jastiper"));
  const trips = useOpenTrips("", 5);
  const latest = trips.data?.pages[0]?.items ?? [];

  const search = (city: string) =>
    navigate(city ? `/trips?city=${encodeURIComponent(city)}` : "/trips");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-14 px-4 py-8 sm:py-10">
      <section className="overflow-hidden rounded-3xl bg-highlight text-highlight-foreground">
        <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
              Mau nitip apa dari luar negeri?
            </h1>
            <p className="max-w-md text-lg">
              Pilih jastiper yang lagi jalan-jalan, titip barang incaranmu, dan bayar dengan aman.
              Uangmu baru diteruskan setelah barang sampai di tanganmu.
            </p>
            <form
              className="flex max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                search(query.trim());
              }}
            >
              <Label htmlFor="hero-search" className="sr-only">
                Cari kota tujuan
              </Label>
              <Input
                id="hero-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kota, misalnya Tokyo"
                className="h-12 rounded-full border-transparent px-5"
              />
              <Button size="lg" type="submit">
                <SearchIcon data-icon="inline-start" />
                Cari
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 text-sm">
              {cities.map((c) => (
                <Link
                  key={c}
                  to={`/trips?city=${c}`}
                  className="rounded-full border border-highlight-foreground/20 px-3 py-1 hover:bg-highlight-foreground/5"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <div
            className="relative mx-auto grid w-full max-w-xs grid-cols-2 gap-x-3 gap-y-1 md:max-w-[19rem]"
            aria-hidden
          >
            {heroItems.map((item, i) => (
              <div
                key={item.name}
                className={cn(
                  "space-y-2 rounded-2xl bg-card p-2.5 pb-3 text-foreground shadow-[0_1px_0_rgb(0_0_0/0.08)]",
                  item.className,
                )}
              >
                <ProductImage name={item.name} tone={i % 2 ? "rambu" : "paspor"} />
                <p className="line-clamp-1 px-0.5 text-sm font-medium">{item.name}</p>
                <p className="px-0.5 text-sm text-muted-foreground">Dari {item.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-bold">Trip yang masih buka</h2>
          <Button variant="secondary" asChild>
            <Link to="/trips">Lihat semua trip</Link>
          </Button>
        </div>
        {trips.isPending ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : latest.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
            Belum ada trip yang buka.{" "}
            {isJastiper ? (
              <Link to="/my-trips/new" className="font-medium text-primary hover:underline">
                Buka trip pertamamu
              </Link>
            ) : (
              "Cek lagi nanti, ya."
            )}
          </div>
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {latest.map((t) => (
              <li key={t.id}>
                <TripRow trip={t} to={`/trip/${t.slug}`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-3xl font-bold">
          <ShieldCheckIcon className="size-7 text-primary" aria-hidden />
          Aman karena uangmu ditahan dulu
        </h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="space-y-1">
              <p className="font-heading text-lg font-semibold">
                <span className="mr-2 text-primary tabular-nums">{i + 1}.</span>
                {s.title}
              </p>
              <p className="text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
