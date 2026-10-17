import { SearchIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderStatusBadge, type OrderStatus } from "@/components/OrderStatusBadge";
import { ProductImage } from "@/components/ProductImage";
import { ProductTile } from "@/components/ProductTile";
import { Receipt, ReceiptPerforation, ReceiptSection } from "@/components/Receipt";
import { formatDate, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Titi, type TitiPose } from "./TitiSketch";

// Visual reference for the team. Only registered in the router during development.
// Explanations are in English; example UI copy stays in Indonesian like the real app.
// All data here is sample data; real product photos will come from the API.

const palette = [
  {
    name: "Merah",
    hex: "#DD010F",
    role: "Brand color from the logo, primary actions, trust signals",
    swatch: "bg-primary",
  },
  { name: "Tinta", hex: "#161616", role: "Text, icons, Titi's face", swatch: "bg-foreground" },
  { name: "Kertas", hex: "#F7F6F4", role: "Page background", swatch: "bg-background" },
  { name: "Putih", hex: "#FFFFFF", role: "Cards, receipts, inputs, dialogs", swatch: "bg-card" },
  { name: "Garis", hex: "#E2DFDB", role: "Borders and dividers", swatch: "bg-border" },
  {
    name: "Merah muda",
    hex: "#FDECED",
    role: "Soft brand surfaces: escrow notes, selected chips",
    swatch: "bg-secondary",
  },
  { name: "Abu", hex: "#EFEDEA", role: "Quiet surfaces, final statuses", swatch: "bg-muted" },
  {
    name: "Rambu",
    hex: "#F5C400",
    role: "Attention only (waiting states)",
    swatch: "bg-highlight",
  },
  { name: "Cap", hex: "#8F1420", role: "Errors and disputes", swatch: "bg-destructive" },
];

const statuses: OrderStatus[] = [
  "requested",
  "approved",
  "paid",
  "shipped",
  "delivered",
  "released",
  "disputed",
  "refunded",
  "rejected",
  "cancelled",
];

const products = [
  { name: "COSRX Snail Mucin 96 Essence", city: "Seoul", estimatedPrice: 210_000, tone: "rambu" },
  { name: "Tokyo Banana isi 8", city: "Tokyo", estimatedPrice: 145_000, tone: "paspor" },
  { name: "Onitsuka Tiger Mexico 66", city: "Tokyo", estimatedPrice: 1_450_000, tone: "netral" },
  { name: "Pocky Matcha edisi Kyoto", city: "Tokyo", estimatedPrice: 60_000, tone: "rambu" },
] as const;

const trips = [
  {
    city: "Seoul",
    jastiper: "Rina",
    depart: "2026-10-12",
    close: "2026-10-08",
    remaining: 6,
    items: ["Snail Mucin", "Masker Mediheal", "Tteokbokki instan"],
    more: 5,
  },
  {
    city: "Tokyo",
    jastiper: "Dimas",
    depart: "2026-10-20",
    close: "2026-10-15",
    remaining: 12,
    items: ["Tokyo Banana", "Onitsuka Tiger", "Pocky Matcha"],
    more: 9,
  },
  {
    city: "Bangkok",
    jastiper: "Sekar",
    depart: "2026-11-02",
    close: "2026-10-28",
    remaining: 1,
    items: ["Thai Tea Cha Tra Mue", "Balsem Tiger"],
    more: 0,
  },
];

const tones = ["rambu", "paspor", "netral"] as const;

const typeScale = [
  {
    role: "Display",
    classes: "text-4xl sm:text-5xl",
    className: "font-heading text-4xl font-extrabold tracking-tight sm:text-5xl",
    sample: "Mau nitip apa?",
  },
  {
    role: "Page title",
    classes: "h1",
    className: "font-heading text-3xl font-extrabold tracking-tight sm:text-4xl",
    sample: "Titipan dari Tokyo",
  },
  {
    role: "Section",
    classes: "h2",
    className: "font-heading text-xl font-extrabold tracking-tight sm:text-2xl",
    sample: "Barang populer minggu ini",
  },
  {
    role: "Subsection",
    classes: "h3",
    className: "font-heading text-lg font-extrabold tracking-tight",
    sample: "Rincian harga",
  },
  {
    role: "Body",
    classes: "text-base",
    className: "max-w-prose",
    sample: "Rina berangkat ke Seoul tanggal 12 Oktober dan masih bisa bawa 6 barang lagi.",
  },
  {
    role: "Small",
    classes: "text-sm",
    className: "text-sm text-muted-foreground",
    sample: "Titip sebelum 8 Oktober, ya.",
  },
  {
    role: "Caption",
    classes: "text-xs",
    className: "text-xs text-muted-foreground",
    sample: "Diperbarui 2 jam lalu",
  },
];

const radii = [
  { className: "rounded-md", use: "Buttons, chips" },
  { className: "rounded-lg", use: "Inputs, list photos" },
  { className: "rounded-xl", use: "Cards, receipts, dialogs" },
  { className: "rounded-2xl", use: "Landing hero only" },
  { className: "rounded-full", use: "Status badge, avatar" },
];

const heroItems = [
  { name: "Snail Mucin 96", city: "Seoul", price: 210_000, className: "-rotate-3" },
  { name: "Tokyo Banana", city: "Tokyo", price: 145_000, className: "mt-6 rotate-2" },
  {
    name: "Thai Tea Cha Tra Mue",
    city: "Bangkok",
    price: 85_000,
    className: "hidden sm:block rotate-1",
  },
  {
    name: "Pocky Matcha",
    city: "Kyoto",
    price: 60_000,
    className: "hidden sm:block mt-6 -rotate-2",
  },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border-t pt-10">
      <div className="max-w-prose space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {note && <p className="text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}

const titiPoses: { pose: TitiPose; label: string; use: string }[] = [
  { pose: "menyapa", label: "Menyapa", use: "Landing, onboarding" },
  { pose: "senang", label: "Senang", use: "Bayar sukses, barang diterima, dana cair" },
  { pose: "bingung", label: "Bingung", use: "Empty state, pencarian kosong, 404" },
  { pose: "menunggu", label: "Menunggu", use: "Menunggu persetujuan atau pembayaran" },
  { pose: "khawatir", label: "Khawatir", use: "Error, sengketa" },
  { pose: "tidur", label: "Tidur", use: "Trip yang sudah ditutup atau selesai" },
];

function TitiEmptyState({ layout }: { layout: "mobile" | "desktop" }) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border bg-card p-5",
        layout === "mobile"
          ? "flex-col items-center text-center"
          : "items-center gap-8 p-8 text-left",
      )}
    >
      <Titi pose="bingung" className={layout === "mobile" ? "size-24" : "size-36 shrink-0"} />
      <div className={cn("space-y-3", layout === "mobile" && "flex flex-col items-center")}>
        <p className="font-heading text-xl font-bold">Belum ada titipan</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Cari jastiper yang lagi ke kota tujuan barang incaranmu, lalu titip dari halaman trip-nya.
        </p>
        <Button className={layout === "mobile" ? "w-full" : undefined}>Cari trip</Button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
      <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <h3 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
            Mau nitip apa dari Seoul?
          </h3>
          <p className="max-w-md text-lg">
            Pilih jastiper yang lagi jalan-jalan, titip barang incaranmu, dan bayar dengan aman.
            Uangmu baru diteruskan setelah barang sampai di tanganmu.
          </p>
          <form className="flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <Label htmlFor="sg-hero-search" className="sr-only">
              Cari barang atau kota
            </Label>
            <Input
              id="sg-hero-search"
              placeholder="Cari barang atau kota"
              className="h-12 border-transparent px-4 text-foreground focus-visible:ring-primary-foreground/70"
            />
            <Button
              size="lg"
              type="submit"
              className="bg-foreground text-background hover:bg-foreground/85 focus-visible:ring-primary-foreground/70"
            >
              <SearchIcon data-icon="inline-start" />
              Cari
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 text-sm">
            {["Seoul", "Tokyo", "Bangkok", "Singapura", "Osaka"].map((c) => (
              <a
                key={c}
                href="#"
                className="rounded-md border border-primary-foreground/40 px-3 py-1 font-medium outline-none hover:bg-primary-foreground/10 focus-visible:ring-3 focus-visible:ring-primary-foreground/70"
              >
                {c}
              </a>
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
                "space-y-2 rounded-xl bg-card p-2.5 pb-3 text-foreground",
                item.className,
              )}
            >
              <ProductImage name={item.name} tone={i % 2 ? "rambu" : "paspor"} />
              <p className="line-clamp-1 px-0.5 text-sm font-medium">{item.name}</p>
              <p className="px-0.5 text-sm text-muted-foreground tabular-nums">
                {item.city}, {formatRupiah(item.price)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Component() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10">
      <header className="max-w-prose space-y-2">
        <h1 className="text-5xl font-extrabold">Visual guide</h1>
        <p className="text-muted-foreground">
          Fun but simple, and flat. This page is the living version of <code>DESIGN.md</code>;
          change both together, after the team agrees. Tokens live in <code>src/index.css</code>,
          shared components in <code>src/components/</code>.
        </p>
      </header>

      <Section
        title="Hero landing page"
        note="The only full-red surface with white text and the only rounded-2xl container. Do not repeat it on other pages."
      >
        <Hero />
      </Section>

      <Section
        title="Titi (mascot)"
        note="Flat, at most one per screen, never in forms, tables, or admin. Animations stop when the device asks for reduced motion."
      >
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {titiPoses.map((p) => (
            <li key={p.pose} className="flex flex-col items-center gap-2 text-center">
              <Titi pose={p.pose} className="size-28 lg:size-36" />
              <p className="font-medium">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.use}</p>
            </li>
          ))}
          <li className="flex flex-col items-center gap-2 text-center">
            <div className="flex w-full justify-center rounded-lg bg-primary py-4">
              <Titi pose="menyapa" inverted className="size-24 lg:size-28" />
            </div>
            <p className="font-medium">Varian terbalik</p>
            <p className="text-sm text-muted-foreground">Di atas latar merah, misalnya hero</p>
          </li>
        </ul>
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Mobile (360 px)</p>
            <div className="w-full max-w-[360px]">
              <TitiEmptyState layout="mobile" />
            </div>
          </div>
          <div className="hidden space-y-2 lg:block">
            <p className="text-sm font-medium text-muted-foreground">Desktop</p>
            <TitiEmptyState layout="desktop" />
          </div>
        </div>
      </Section>

      <Section title="Color">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {palette.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className={`${c.swatch} size-12 shrink-0 rounded-lg border`} />
              <div className="text-sm">
                <p className="font-medium">
                  {c.name} <span className="text-muted-foreground tabular-nums">{c.hex}</span>
                </p>
                <p className="text-muted-foreground">{c.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Typography"
        note="Plus Jakarta Sans throughout; headings extra-bold like the logo. Prices always use tabular-nums."
      >
        <dl className="space-y-4">
          {typeScale.map((t) => (
            <div key={t.role} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline">
              <dt className="text-sm text-muted-foreground">
                {t.role} <code className="text-xs">{t.classes}</code>
              </dt>
              <dd className={t.className}>{t.sample}</dd>
            </div>
          ))}
          <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-baseline">
            <dt className="text-sm text-muted-foreground">Money</dt>
            <dd className="text-2xl font-semibold tabular-nums">{formatRupiah(1_250_000)}</dd>
          </div>
        </dl>
      </Section>

      <Section
        title="Radius and surfaces"
        note="Flat: borders and white on Kertas separate surfaces, no shadows except floating layers."
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {radii.map((r) => (
            <li key={r.className} className="space-y-2 text-sm">
              <div className={cn("h-16 border bg-card", r.className)} />
              <p className="font-medium">
                <code>{r.className}</code>
              </p>
              <p className="text-muted-foreground">{r.use}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Buttons and forms"
        note="Button labels name the action: “Bayar sekarang”, not “Submit”."
      >
        <div className="flex flex-wrap gap-3">
          <Button>Titip barang ini</Button>
          <Button variant="secondary">Lihat trip</Button>
          <Button variant="outline">Batal</Button>
          <Button variant="ghost">Nanti saja</Button>
          <Button variant="destructive">Ajukan sengketa</Button>
        </div>
        <div className="grid max-w-md gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="sg-product">Nama barang</Label>
            <Input id="sg-product" placeholder="Contoh: COSRX Snail Mucin 96 Essence 100 ml" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sg-qty">Jumlah</Label>
            <Input id="sg-qty" type="number" defaultValue={0} aria-invalid />
            <p className="text-sm text-destructive">Jumlah minimal 1.</p>
          </div>
        </div>
      </Section>

      <Section
        title="Product catalog"
        note="Product photo first. Catalog prices are estimates; the jastiper sets the final price."
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
          {products.map((p) => (
            <ProductTile key={p.name} {...p} href="#" />
          ))}
        </div>
      </Section>

      <Section
        title="Trip list"
        note="Each trip shows what you can order from it, not just the schedule."
      >
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {trips.map((t) => (
            <li key={t.city}>
              <a
                href="#"
                className="flex flex-col gap-4 p-4 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-2xl font-bold tracking-tight">{t.city}</p>
                  <p className="text-sm">
                    Bersama <span className="font-medium">{t.jastiper}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Berangkat {formatDate(t.depart)}, titip sebelum {formatDate(t.close)}
                  </p>
                </div>

                <div className="flex items-center gap-2" aria-label="Contoh barang titipan">
                  {t.items.map((item, i) => (
                    <ProductImage
                      key={item}
                      name={item}
                      tone={tones[i % tones.length]}
                      className="size-14 rounded-lg"
                    />
                  ))}
                  {t.more > 0 && (
                    <span className="flex size-14 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                      +{t.more}
                    </span>
                  )}
                </div>

                <div className="text-sm sm:w-28 sm:text-right">
                  {t.remaining <= 2 ? (
                    <span className="rounded-md bg-highlight px-2 py-0.5 font-medium text-highlight-foreground">
                      Tinggal {t.remaining} barang lagi
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sisa {t.remaining} barang</span>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Order status"
        note="Use OrderStatusBadge in every module so status colors stay consistent."
      >
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <OrderStatusBadge key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section
        title="Order receipt (nota titipan)"
        note="For order details: item and price breakdown on top, payment status and actions below the tear line."
      >
        <Receipt className="max-w-xl">
          <ReceiptSection className="space-y-5">
            <div className="flex items-start gap-4">
              <ProductImage name="COSRX Snail Mucin" tone="rambu" className="size-20 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">COSRX Snail Mucin 96 Essence 100 ml</p>
                <p className="text-sm text-muted-foreground">2 barang, dari Seoul bersama Rina</p>
                <OrderStatusBadge status="paid" />
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Harga barang</dt>
                <dd className="tabular-nums">{formatRupiah(420_000)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Fee jastip</dt>
                <dd className="tabular-nums">{formatRupiah(60_000)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
                <dt>Total dibayar</dt>
                <dd className="tabular-nums">{formatRupiah(480_000)}</dd>
              </div>
            </dl>
          </ReceiptSection>
          <ReceiptPerforation />
          <ReceiptSection className="flex flex-wrap items-center justify-between gap-4 bg-secondary/60">
            <p className="flex max-w-xs items-start gap-2 text-sm text-secondary-foreground">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              Uangmu ditahan TITIP DONG dan baru diteruskan ke Rina setelah barang kamu terima.
            </p>
            <Button>Barang sudah diterima</Button>
          </ReceiptSection>
        </Receipt>
      </Section>
    </div>
  );
}
