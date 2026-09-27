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

// Visual reference for the team. Only registered in the router during development.
// Explanations are in English; example UI copy stays in Indonesian like the real app.
// All data here is sample data; real product photos will come from the API.

const palette = [
  {
    name: "Paspor",
    hex: "#1F4D3F",
    role: "Primary actions and trust signals",
    swatch: "bg-primary",
  },
  { name: "Rambu", hex: "#F5C400", role: "Brand color, cheerful surfaces", swatch: "bg-highlight" },
  { name: "Tinta", hex: "#18231F", role: "Body text", swatch: "bg-foreground" },
  { name: "Kertas", hex: "#F4F6F3", role: "Page background", swatch: "bg-background" },
  { name: "Garis", hex: "#D5DBD6", role: "Borders and dividers", swatch: "bg-border" },
  { name: "Cap", hex: "#B3372B", role: "Errors and disputes", swatch: "bg-destructive" },
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
    leftKg: 6,
    items: ["Snail Mucin", "Masker Mediheal", "Tteokbokki instan"],
    more: 5,
  },
  {
    city: "Tokyo",
    jastiper: "Dimas",
    depart: "2026-10-20",
    close: "2026-10-15",
    leftKg: 12,
    items: ["Tokyo Banana", "Onitsuka Tiger", "Pocky Matcha"],
    more: 9,
  },
  {
    city: "Bangkok",
    jastiper: "Sekar",
    depart: "2026-11-02",
    close: "2026-10-28",
    leftKg: 1,
    items: ["Thai Tea Cha Tra Mue", "Balsem Tiger"],
    more: 0,
  },
];

const tones = ["rambu", "paspor", "netral"] as const;

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

function Hero() {
  return (
    <div className="overflow-hidden rounded-3xl bg-highlight text-highlight-foreground">
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
              className="h-12 rounded-full border-transparent px-5"
            />
            <Button size="lg" type="submit">
              <SearchIcon data-icon="inline-start" />
              Cari
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 text-sm">
            {["Seoul", "Tokyo", "Bangkok", "Singapura", "Osaka"].map((c) => (
              <a
                key={c}
                href="#"
                className="rounded-full border border-highlight-foreground/20 px-3 py-1 hover:bg-highlight-foreground/5"
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
                "space-y-2 rounded-2xl bg-card p-2.5 pb-3 text-foreground shadow-[0_1px_0_rgb(0_0_0/0.08)]",
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
          Safe shopping through jastip: products are the star, trust signals are always visible.
          Tokens live in <code>src/index.css</code>, shared components in{" "}
          <code>src/components/</code>. Discuss changes with the team first, since they affect every
          module.
        </p>
      </header>

      <Section
        title="Hero landing page"
        note="The only full-yellow surface. Do not repeat it on other pages."
      >
        <Hero />
      </Section>

      <Section title="Color">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {palette.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className={`${c.swatch} size-12 shrink-0 rounded-xl border`} />
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
        note="Bricolage Grotesque for headings, Barlow for text. Prices always use tabular-nums."
      >
        <div className="space-y-3">
          <p className="font-heading text-5xl font-extrabold tracking-tight">Titipan dari Tokyo</p>
          <p className="font-heading text-3xl font-bold tracking-tight">
            Barang populer minggu ini
          </p>
          <p className="font-heading text-xl font-semibold tracking-tight">Rincian harga</p>
          <p className="max-w-prose">
            Rina berangkat ke Seoul tanggal 12 Oktober dan masih punya sisa bagasi 6 kg. Titip
            sebelum 8 Oktober, ya.
          </p>
          <p className="text-sm text-muted-foreground">Teks pendukung dan keterangan kecil.</p>
          <p className="text-2xl font-semibold tabular-nums">{formatRupiah(1_250_000)}</p>
        </div>
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
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
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
                  {t.leftKg <= 2 ? (
                    <span className="rounded-full bg-highlight px-2 py-0.5 font-medium text-highlight-foreground">
                      Sisa {t.leftKg} kg lagi
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sisa bagasi {t.leftKg} kg</span>
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
