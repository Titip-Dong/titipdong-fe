import { useSearchParams } from "react-router";
import {
  getListAdminTransactionsQueryKey,
  listAdminTransactions,
} from "@/api/generated/endpoints/admin/admin";
import type { ListAdminTransactionsKind } from "@/api/generated/model";
import { LoadMore } from "@/components/LoadMore";
import { Skeleton } from "@/components/ui/skeleton";
import { useCursorList } from "@/lib/pagination";
import { formatDateTime, formatRupiah } from "@/lib/format";

const kinds: { value: ListAdminTransactionsKind | ""; label: string }[] = [
  { value: "", label: "Semua jenis" },
  { value: "payment_received", label: "Pembayaran" },
  { value: "release", label: "Pencairan" },
  { value: "refund", label: "Refund" },
  { value: "refund_paid", label: "Refund dibayar" },
  { value: "payout", label: "Payout" },
];

export function Component() {
  const [params, setParams] = useSearchParams();
  const kind = (params.get("kind") ?? "") as ListAdminTransactionsKind | "";
  const filters = { kind: kind || undefined, limit: 20 };
  const query = useCursorList(getListAdminTransactionsQueryKey(filters), (cursor) =>
    listAdminTransactions({ ...filters, cursor }),
  );
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Transaksi ledger</h1>
        <p className="mt-1 text-muted-foreground">
          Catatan debit dan kredit yang membentuk seluruh saldo platform.
        </p>
      </header>
      <select
        aria-label="Jenis transaksi"
        className="h-10 rounded-md border bg-background px-3"
        value={kind}
        onChange={(event) => setParams(event.target.value ? { kind: event.target.value } : {})}
      >
        {kinds.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {query.isPending && !query.data ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          Transaksi gagal dimuat.
        </p>
      ) : query.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Belum ada transaksi ledger.
        </p>
      ) : (
        <div className="space-y-4">
          {query.items.map((tx) => (
            <article key={tx.id} className="space-y-3 rounded-xl border bg-card p-4">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold capitalize">{tx.kind.replaceAll("_", " ")}</h2>
                  {tx.orderCode && (
                    <p className="text-sm text-muted-foreground">Order {tx.orderCode}</p>
                  )}
                </div>
                <time className="text-sm text-muted-foreground">
                  {formatDateTime(tx.createdAt)}
                </time>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="py-2">Akun</th>
                      <th className="py-2">Arah</th>
                      <th className="py-2">Nominal</th>
                      <th className="py-2">Pemilik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tx.entries.map((entry, index) => (
                      <tr key={`${tx.id}-${index}`}>
                        <td className="py-2 capitalize">{entry.account.replaceAll("_", " ")}</td>
                        <td className="py-2 capitalize">{entry.direction}</td>
                        <td className="py-2 tabular-nums">{formatRupiah(entry.amount)}</td>
                        <td className="py-2">{entry.userId ?? "Platform"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
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
