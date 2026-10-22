import { useQueryClient } from "@tanstack/react-query";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  getGetUnreadCountQueryKey,
  getListNotificationsQueryKey,
  listNotifications,
  useGetUnreadCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/api/generated/endpoints/notification/notification";
import { LoadMore } from "@/components/LoadMore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { useCursorList } from "@/lib/pagination";

function notificationCopy(type: string, data: Record<string, unknown>) {
  const code = typeof data.orderCode === "string" ? data.orderCode : "titipan";
  const reason = typeof data.reason === "string" ? `: ${data.reason}` : "";
  const amount = typeof data.amount === "number" ? formatRupiah(data.amount) : "";
  switch (type) {
    case "order.requested":
      return `Ada permintaan ${String(data.productName ?? "barang")} dari ${String(data.buyerName ?? "pembeli")} (${code}).`;
    case "order.approved":
      return `Titipan ${code} disetujui dengan total ${formatRupiah(Number(data.total ?? 0))}.`;
    case "order.rejected":
      return `Titipan ${code} ditolak${reason}.`;
    case "order.cancelled":
      return `Titipan ${code} dibatalkan${reason}.`;
    case "payment.received":
      return `Pembayaran ${code} sebesar ${amount} sudah diterima.`;
    case "order.shipped":
      return `Titipan ${code} sudah dikirim${data.trackingNumber ? ` dengan resi ${String(data.trackingNumber)}` : ""}.`;
    case "order.released":
      return `Dana ${code} sebesar ${amount} sudah masuk ke saldo.`;
    case "order.refunded":
      return `Refund ${code} sebesar ${amount} sudah diproses.`;
    case "dispute.opened":
      return `Sengketa ${code} dibuka dan menunggu peninjauan.`;
    case "dispute.message":
      return `Ada pesan baru di sengketa ${code}.`;
    case "dispute.resolved":
      return `Sengketa ${code} sudah diputuskan: ${String(data.decision ?? "selesai")}.`;
    case "payout.paid":
      return `Payout sebesar ${amount} sudah dibayar.`;
    case "payout.rejected":
      return `Payout sebesar ${amount} ditolak${reason}.`;
    default:
      return "Ada kabar baru terkait aktivitas akunmu.";
  }
}

function notificationHref(type: string, data: Record<string, unknown>) {
  if (type.startsWith("payout.") || type === "order.released") return "/wallet";
  const orderId = typeof data.orderId === "string" ? data.orderId : undefined;
  return orderId ? `/orders/${orderId}` : undefined;
}

export function Component() {
  const client = useQueryClient();
  const filters = { limit: 20 };
  const list = useCursorList(getListNotificationsQueryKey(filters), (cursor) =>
    listNotifications({ ...filters, cursor }),
  );
  const unreadCount = useGetUnreadCount({
    query: { refetchInterval: 30_000, refetchIntervalInBackground: false },
  });
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
      client.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() }),
    ]);
  };
  const markOne = useMarkNotificationRead({
    mutation: {
      onSuccess: () => void invalidate(),
      onError: () => toast.error("Notifikasi gagal diperbarui."),
    },
  });
  const markAll = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => {
        void invalidate();
        toast.success("Semua notifikasi ditandai sudah dibaca.");
      },
      onError: () => toast.error("Notifikasi gagal diperbarui."),
    },
  });
  const unread = (unreadCount.data?.count ?? 0) > 0;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifikasi</h1>
          <p className="mt-1 text-muted-foreground">
            Kabar terbaru tentang titipan dan saldo kamu.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!unread || markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          <CheckCheckIcon data-icon="inline-start" /> Tandai semua dibaca
        </Button>
      </header>
      {list.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : list.isError ? (
        <p role="alert" className="rounded-xl border border-destructive/30 p-5 text-destructive">
          Notifikasi gagal dimuat. Coba muat ulang halaman.
        </p>
      ) : list.items.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <BellIcon className="mx-auto size-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-medium">Belum ada notifikasi</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kabar aktivitasmu akan muncul di sini.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {list.items.map((item) => {
            const href = notificationHref(item.type, item.data);
            const body = notificationCopy(item.type, item.data);
            return (
              <li
                key={item.id}
                className={`flex gap-3 p-4 ${item.readAt ? "" : "bg-secondary/40"}`}
              >
                <span
                  className={`mt-2 size-2 shrink-0 rounded-full ${item.readAt ? "bg-muted" : "bg-primary"}`}
                  aria-label={item.readAt ? "Sudah dibaca" : "Belum dibaca"}
                />
                <div className="min-w-0 flex-1">
                  {href ? (
                    <Link
                      to={href}
                      onClick={() => !item.readAt && markOne.mutate({ id: item.id })}
                      className="font-medium hover:underline"
                    >
                      {body}
                    </Link>
                  ) : (
                    <p className="font-medium">{body}</p>
                  )}
                  <time className="mt-1 block text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </time>
                </div>
                {!item.readAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={markOne.isPending}
                    onClick={() => markOne.mutate({ id: item.id })}
                  >
                    Tandai dibaca
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <LoadMore
        hasNextPage={!!list.hasNextPage}
        isFetchingNextPage={list.isFetchingNextPage}
        fetchNextPage={list.fetchNextPage}
      />
    </main>
  );
}
