import type { EventResponse, OrderResponse } from "@/api/generated/model";
import { formatDateTime } from "@/lib/format";

const labels: Record<string, string> = {
  requested: "Titipan dikirim",
  approved: "Disetujui, harga ditentukan",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
  paid: "Dibayar, dana ditahan TITIP DONG",
  shipped: "Barang dikirim",
  delivered: "Barang diterima",
  disputed: "Sengketa diajukan",
  released: "Dana diteruskan ke jastiper",
  refunded: "Dana dikembalikan",
};

function actorName(event: EventResponse, order: OrderResponse): string {
  switch (event.actorType) {
    case "buyer":
      return order.buyer.name;
    case "jastiper":
      return order.jastiper.name;
    case "admin":
      return "Admin";
    default:
      return "Sistem";
  }
}

/** Status history of an order, oldest first. */
export function Timeline({ events, order }: { events: EventResponse[]; order: OrderResponse }) {
  return (
    <ol className="space-y-4 border-l-2 pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-background bg-primary" />
          <p className="font-medium">{labels[e.toStatus] ?? e.toStatus}</p>
          <p className="text-sm text-muted-foreground">
            {actorName(e, order)} · {formatDateTime(e.createdAt)}
          </p>
          {e.reason && <p className="text-sm">{e.reason}</p>}
        </li>
      ))}
    </ol>
  );
}
