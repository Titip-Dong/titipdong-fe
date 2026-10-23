import { cn } from "@/lib/utils";

/**
 * Receipt-style container ("nota titipan") for order details and order summaries.
 * Top: item and price breakdown. Below the tear line: payment/escrow status and actions.
 */
export function Receipt({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card", className)} {...props} />
  );
}

export function ReceiptSection({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

/** Dashed tear line with notches on both sides. */
export function ReceiptPerforation({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative h-0", className)}>
      <div className="mx-6 border-t-2 border-dashed border-foreground/20" />
      <span className="absolute top-0 -left-4 size-8 -translate-y-1/2 rounded-full border bg-background" />
      <span className="absolute top-0 -right-4 size-8 -translate-y-1/2 rounded-full border bg-background" />
    </div>
  );
}
