import { Link } from "react-router";
import { useGetAdminStats } from "@/api/generated/endpoints/admin/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/format";

export function Component() {
  const query = useGetAdminStats();
  if (query.isPending)
    return (
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-10">
        <h1 className="text-3xl font-bold">Dashboard admin</h1>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </main>
    );
  if (query.isError || !query.data)
    return (
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <h1 className="text-3xl font-bold">Dashboard admin</h1>
        <p role="alert" className="text-destructive">
          Ringkasan gagal dimuat. Muat ulang halaman, ya.
        </p>
      </main>
    );
  const stats = query.data;
  const users = stats.users.reduce((sum, row) => sum + row.count, 0);
  const cards = [
    ["Pengguna", String(users), "/admin/users"],
    ["GMV", formatRupiah(stats.gmv), "/admin/orders"],
    ["Dana escrow", formatRupiah(stats.escrowHeld), "/admin/orders?status=paid"],
    ["Pendapatan platform", formatRupiah(stats.platformRevenue), "/admin/transactions"],
    [
      "Payout menunggu",
      `${stats.pendingPayouts.count} · ${formatRupiah(stats.pendingPayouts.amount)}`,
      "/admin/payouts",
    ],
    ["Sengketa terbuka", String(stats.openDisputes), "/admin/disputes"],
  ];
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Dashboard admin</h1>
        <p className="mt-1 text-muted-foreground">
          Pantau aktivitas TITIP DONG dan tindak lanjuti antrean.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link
            key={label}
            to={href}
            className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
          </Link>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Order menurut status</h2>
        {stats.orders.length ? (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3">Nilai total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.orders.map((row) => (
                  <tr key={row.status}>
                    <td className="p-3 capitalize">{row.status}</td>
                    <td className="p-3 tabular-nums">{row.count}</td>
                    <td className="p-3 tabular-nums">{formatRupiah(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border bg-card p-5 text-muted-foreground">Belum ada order.</p>
        )}
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Kewajiban ke jastiper</p>
          <p className="mt-2 text-xl font-bold tabular-nums">
            {formatRupiah(stats.payableOutstanding)}
          </p>
        </article>
        <article className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Refund menunggu gateway</p>
          <p className="mt-2 text-xl font-bold tabular-nums">
            {formatRupiah(stats.buyerRefundable)}
          </p>
        </article>
      </section>
    </main>
  );
}
