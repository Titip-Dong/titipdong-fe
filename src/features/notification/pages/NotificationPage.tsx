import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  useListNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/api/generated/endpoints/notification/notification";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRupiah } from "@/lib/format";

function copy(type: string, data: Record<string, unknown>) {
  const code = typeof data.orderCode === "string" ? ` ${data.orderCode}` : "";
  const amount = typeof data.amount === "number" ? ` ${formatRupiah(data.amount)}` : "";
  const messages: Record<string, string> = {
    "order.requested": `Ada titipan baru${code}.`,
    "order.approved": `Titipan${code} disetujui.${amount ? ` Totalnya${amount}.` : ""}`,
    "order.rejected": `Titipan${code} ditolak.`,
    "order.cancelled": `Titipan${code} dibatalkan.`,
    "payment.received": `Pembayaran${code} sudah diterima.`,
    "order.shipped": `Titipan${code} sudah dikirim.`,
    "order.released": `Dana titipan${code} sudah dicairkan.${amount ? ` Bagianmu${amount}.` : ""}`,
    "order.refunded": `Titipan${code} sudah direfund.`,
    "dispute.opened": `Ada sengketa baru untuk titipan${code}.`,
    "dispute.message": `Ada pesan baru di sengketa${code}.`,
    "dispute.resolved": `Sengketa${code} sudah diputuskan.`,
    "payout.paid": `Pencairan saldo${amount} sudah dibayar.`,
    "payout.rejected": `Permintaan pencairan${amount} ditolak.`,
  };
  return messages[type] ?? "Ada kabar baru dari TITIP DONG.";
}

export function Component() {
  const client = useQueryClient();
  const query = useListNotifications({ limit: 100 });
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = (query.data?.items ?? []).filter((item) => !item.readAt);

  async function markAllRead() {
    try {
      await markAll.mutateAsync();
      await client.invalidateQueries();
    } catch {
      toast.error("Notifikasi gagal diperbarui.");
    }
  }

  async function openNotification(id: string, readAt?: string) {
    if (readAt) return;
    try {
      await markOne.mutateAsync({ id });
      await client.invalidateQueries();
    } catch {
      toast.error("Notifikasi gagal diperbarui.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Notifikasi</h1>
          <p className="mt-2 text-muted-foreground">
            Kabar terbaru tentang titipan dan saldo kamu.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={unread.length === 0 || markAll.isPending}
          onClick={markAllRead}
        >
          Tandai semua dibaca
        </Button>
      </header>
      {query.isPending ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : query.isError ? (
        <p className="text-destructive">Notifikasi gagal dimuat. Muat ulang halaman, ya.</p>
      ) : query.data.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Belum ada notifikasi. Kabar baru akan muncul di sini.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {query.data.items.map((item) => {
            const data = item.data as Record<string, unknown>;
            const orderId = typeof data.orderId === "string" ? data.orderId : undefined;
            const href = orderId ? `/orders/${orderId}` : "/notifications";
            return (
              <li key={item.id} className={item.readAt ? "" : "bg-primary/5"}>
                <Link
                  to={href}
                  onClick={() => void openNotification(item.id, item.readAt)}
                  className="block p-4 hover:bg-muted"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${item.readAt ? "bg-transparent" : "bg-primary"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p>{copy(item.type, data)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs text-primary">{item.readAt ? "Dibaca" : "Baru"}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
