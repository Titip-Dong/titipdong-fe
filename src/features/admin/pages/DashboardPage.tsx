import { useGetAdminStats } from "@/api/generated/endpoints/admin/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/format";

export function Component() {
  const { data, isPending, isError } = useGetAdminStats();
  if (isPending)
    return (
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <h1 className="text-4xl font-bold">Dashboard admin</h1>
        <Skeleton className="h-48 rounded-xl" />
      </main>
    );
  if (isError || !data)
    return (
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <h1 className="text-4xl font-bold">Dashboard admin</h1>
        <p className="text-destructive">Ringkasan gagal dimuat. Muat ulang halaman, ya.</p>
      </main>
    );
  const totalUsers = data.users.reduce((sum, item) => sum + item.count, 0);
  const cards = [
    ["Total pengguna", String(totalUsers)],
    ["GMV", formatRupiah(data.gmv)],
    ["Dana di escrow", formatRupiah(data.escrowHeld)],
    ["Pendapatan platform", formatRupiah(data.platformRevenue)],
    ["Perlu payout", `${data.pendingPayouts.count} · ${formatRupiah(data.pendingPayouts.amount)}`],
    ["Sengketa terbuka", String(data.openDisputes)],
  ];
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Dashboard admin</h1>
        <p className="mt-2 text-muted-foreground">Ringkasan aktivitas dan dana TITIP DONG.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
          </article>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Status titipan</h2>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Nilai order</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.orders.map((row) => (
                <tr key={row.status}>
                  <td className="p-3 capitalize">{row.status}</td>
                  <td className="p-3 tabular-nums">{row.count}</td>
                  <td className="p-3 tabular-nums">{formatRupiah(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
