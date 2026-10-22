import { useSearchParams } from "react-router";
import { getListAdminOrdersQueryKey, listAdminOrders } from "@/api/generated/endpoints/admin/admin";
import type { ListAdminOrdersStatus } from "@/api/generated/model";
import { LoadMore } from "@/components/LoadMore";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCursorList } from "@/lib/pagination";
import { formatDate, formatRupiah } from "@/lib/format";
import { Link } from "react-router";

const statuses: { value: ListAdminOrdersStatus | ""; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "requested", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "paid", label: "Dibayar" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Diterima" },
  { value: "disputed", label: "Sengketa" },
  { value: "released", label: "Selesai" },
  { value: "refunded", label: "Refund" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "rejected", label: "Ditolak" },
];

export function Component() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "") as ListAdminOrdersStatus | "";
  const code = params.get("code") ?? "";
  const filters = { status: status || undefined, code: code || undefined, limit: 20 };
  const query = useCursorList(getListAdminOrdersQueryKey(filters), (cursor) =>
    listAdminOrders({ ...filters, cursor }),
  );
  const change = (key: string, value: string) =>
    setParams((current) => {
      const values = Object.fromEntries(current.entries());
      if (value) values[key] = value;
      else delete values[key];
      return new URLSearchParams(values);
    });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Semua order</h1>
        <p className="mt-1 text-muted-foreground">
          Cari order dan buka detailnya untuk meninjau status.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          aria-label="Cari kode order"
          placeholder="Cari kode order"
          value={code}
          onChange={(event) => change("code", event.target.value)}
        />
        <select
          aria-label="Filter status"
          className="h-10 rounded-md border bg-background px-3"
          value={status}
          onChange={(event) => change("status", event.target.value)}
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      {query.isPending && !query.data ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          Order gagal dimuat.
        </p>
      ) : query.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Tidak ada order yang cocok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Produk / trip</th>
                <th className="p-3">Pembeli</th>
                <th className="p-3">Jastiper</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-3">
                    <Link
                      className="font-medium text-primary hover:underline"
                      to={`/orders/${item.id}`}
                    >
                      {item.code}
                    </Link>
                  </td>
                  <td className="p-3">
                    {item.productName}
                    <span className="block text-xs text-muted-foreground">
                      {item.trip.title} · {item.quantity} barang
                    </span>
                  </td>
                  <td className="p-3">{item.buyer.name}</td>
                  <td className="p-3">{item.jastiper.name}</td>
                  <td className="p-3">
                    <OrderStatusBadge status={item.status as never} />
                  </td>
                  <td className="p-3 tabular-nums">
                    {item.total === undefined ? "—" : formatRupiah(item.total)}
                  </td>
                  <td className="p-3">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <LoadMore
        hasNextPage={!!query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </main>
  );
}
