import type { CatalogPreview } from "@/api/generated/model";
import { ProductImage } from "@/components/ProductImage";

const tones = ["rambu", "paspor", "netral"] as const;

/** First catalog photos of a trip; a single empty tile when the jastiper has not added items yet. */
export function TripPhotos({ preview }: { preview?: CatalogPreview }) {
  const items = preview?.items ?? [];
  const more = (preview?.itemCount ?? 0) - items.length;

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <ProductImage name="Belum ada barang" className="size-14 shrink-0 rounded-lg" />
        <span className="text-sm text-muted-foreground">Katalog belum diisi</span>
      </div>
    );
  }

  return (
    <ul className="flex items-center gap-2" aria-label="Barang di katalog">
      {items.map((item, i) => (
        <li key={`${item.name}-${i}`}>
          <ProductImage
            src={item.photoUrl}
            name={item.name}
            tone={tones[i % tones.length]}
            className="size-14 rounded-lg"
          />
        </li>
      ))}
      {more > 0 && (
        <li className="flex size-14 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground tabular-nums">
          +{more}
        </li>
      )}
    </ul>
  );
}
