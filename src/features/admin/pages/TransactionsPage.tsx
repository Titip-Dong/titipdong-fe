import { Link } from "react-router";
import { useListAdminTransactions } from "@/api/generated/endpoints/admin/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRupiah } from "@/lib/format";

export function Component() {
  const query = useListAdminTransactions({ limit: 100 });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Transaksi ledger</h1>
        <p className="mt-2 text-muted-foreground">
          Jurnal debit dan kredit. Saldo diturunkan dari catatan ledger.
        </p>
      </header>
      {query.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : query.isError ? (
        <p className="text-destructive">Transaksi gagal dimuat.</p>
      ) : query.data.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Belum ada transaksi ledger.
        </p>
      ) : (
        <div className="space-y-4">
          {query.data.items.map((tx) => (
            <article key={tx.id} className="space-y-3 rounded-xl border bg-card p-4">
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold capitalize">{tx.kind.replaceAll("_", " ")}</p>
                  {tx.orderId && (
                    <Link
                      to={`/orders/${tx.orderId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Order {tx.orderCode ?? tx.orderId}
                    </Link>
                  )}
                </div>
                <time className="text-sm text-muted-foreground">
                  {formatDateTime(tx.createdAt)}
                </time>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="py-1">Akun</th>
                      <th className="py-1">Arah</th>
                      <th className="py-1">Nominal</th>
                      <th className="py-1">Pemilik akun</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tx.entries.map((entry, index) => (
                      <tr key={`${tx.id}-${index}`}>
                        <td className="py-2">{entry.account.replaceAll("_", " ")}</td>
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
    </main>
  );
}
