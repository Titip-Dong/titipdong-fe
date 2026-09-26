import { ProductImage } from "@/components/ProductImage";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ProductTileProps {
  name: string;
  city: string;
  /** Estimated item price in rupiah. The final price is set by the jastiper. */
  estimatedPrice?: number;
  imageUrl?: string | null;
  tone?: React.ComponentProps<typeof ProductImage>["tone"];
  href?: string;
  className?: string;
}

/** Catalog item: photo first, then name and estimated price. */
export function ProductTile({
  name,
  city,
  estimatedPrice,
  imageUrl,
  tone,
  href,
  className,
}: ProductTileProps) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      href={href}
      className={cn(
        "group flex flex-col gap-2 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <ProductImage
        src={imageUrl}
        name={name}
        tone={tone}
        className="transition-transform group-hover:scale-[1.02]"
      />
      <div className="space-y-0.5 px-0.5">
        <p className="line-clamp-2 leading-snug font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">
          Dari {city}
          {estimatedPrice !== undefined && (
            <>
              , sekitar <span className="tabular-nums">{formatRupiah(estimatedPrice)}</span>
            </>
          )}
        </p>
      </div>
    </Wrapper>
  );
}
