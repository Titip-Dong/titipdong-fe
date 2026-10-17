import { ShieldCheckIcon } from "lucide-react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ProductImage } from "@/components/ProductImage";
import { Receipt, ReceiptPerforation, ReceiptSection } from "@/components/Receipt";
import { formatRupiah } from "@/lib/format";

const promise = "Uangmu ditahan TITIP DONG sampai barangnya sampai di tanganmu.";

/** Sample nota titipan on the red panel: shows how escrow works instead of a slogan. */
function SampleReceipt() {
  return (
    // The tear-line notches take the page background; on the red panel that is Merah.
    <Receipt
      className="w-full max-w-xs rotate-2 text-foreground [--background:var(--primary)] [--border:var(--primary)]"
      aria-hidden
    >
      <ReceiptSection className="space-y-4">
        <div className="flex items-center gap-3">
          <ProductImage name="Tokyo Banana isi 8" tone="rambu" className="size-14 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-medium">Tokyo Banana isi 8</p>
            <p className="text-sm text-muted-foreground">Dari Tokyo bersama Dimas</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold tabular-nums">{formatRupiah(305_000)}</span>
        </div>
      </ReceiptSection>
      <ReceiptPerforation />
      <ReceiptSection className="space-y-3">
        <OrderStatusBadge status="paid" />
        <p className="flex items-start gap-2 text-sm text-secondary-foreground">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
          Diteruskan ke Dimas setelah kamu terima barangnya.
        </p>
      </ReceiptSection>
    </Receipt>
  );
}

/** Layout for login and register: form on the right, red escrow panel on the left from `lg`. */
export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:py-12">
      <p className="flex items-start gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground lg:hidden">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        {promise}
      </p>

      <aside className="hidden flex-col justify-between gap-10 overflow-hidden rounded-xl bg-primary p-10 text-primary-foreground lg:flex">
        <p className="font-heading text-4xl leading-[1.05] font-extrabold tracking-tight text-balance">
          {promise}
        </p>
        <SampleReceipt />
      </aside>

      <section className="w-full max-w-sm space-y-6 lg:self-center">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </header>
        {children}
        <p className="text-sm text-muted-foreground">{footer}</p>
      </section>
    </div>
  );
}
