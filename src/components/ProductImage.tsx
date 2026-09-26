import { ShoppingBagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  rambu: "bg-highlight-soft text-highlight-foreground/35",
  paspor: "bg-secondary text-primary/35",
  netral: "bg-muted text-muted-foreground/45",
} as const;

/** Product photo. Falls back to a shopping bag icon on a tinted background when there is no photo. */
export function ProductImage({
  src,
  name,
  tone = "netral",
  className,
}: {
  src?: string | null;
  name: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={cn("aspect-square w-full rounded-xl bg-muted object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl",
        tones[tone],
        className,
      )}
    >
      <ShoppingBagIcon className="size-1/3 max-h-16 max-w-16" strokeWidth={1.5} />
    </div>
  );
}
