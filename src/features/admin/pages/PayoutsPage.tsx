import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  getGetAdminStatsQueryKey,
  getListPayoutsQueryKey,
  listPayouts,
  useMarkPayoutPaid,
  useRejectPayout,
} from "@/api/generated/endpoints/admin/admin";
import type { ListPayoutsStatus } from "@/api/generated/model";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadMore } from "@/components/LoadMore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCursorList } from "@/lib/pagination";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime, formatRupiah } from "@/lib/format";

export function Component() {
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "requested") as ListPayoutsStatus | "";
  const filters = { status: status || undefined, limit: 20 };
  const list = useCursorList(getListPayoutsQueryKey(filters), (cursor) =>
    listPayouts({ ...filters, cursor }),
  );
  const [reference, setReference] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  const refresh = async () =>
    Promise.all([
      client.invalidateQueries({ queryKey: getListPayoutsQueryKey() }),
      client.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() }),
    ]);
  const paid = useMarkPayoutPaid({
    mutation: {
      onSuccess: async () => {
        await refresh();
        toast.success("Payout ditandai sudah dibayar.");
      },
      onError: (error) =>
        toast.error(errorMessage(error, { 409: "Payout ini sudah diputuskan admin lain." })),
    },
  });
  const reject = useRejectPayout({
    mutation: {
      onSuccess: async () => {
        await refresh();
        toast.success("Permintaan payout ditolak.");
      },
      onError: (error) =>
        toast.error(errorMessage(error, { 409: "Payout ini sudah diputuskan admin lain." })),
    },
  });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Antrean payout</h1>
        <p className="mt-1 text-muted-foreground">
          Transfer di luar aplikasi, lalu catat referensi transfer atau alasan penolakan.
        </p>
      </header>
      <select
        aria-label="Filter status payout"
        className="h-10 rounded-md border bg-background px-3"
        value={status}
        onChange={(event) => setParams(event.target.value ? { status: event.target.value } : {})}
      >
        <option value="requested">Menunggu</option>
        <option value="paid">Dibayar</option>
        <option value="rejected">Ditolak</option>
        <option value="">Semua status</option>
      </select>
      {list.isPending && !list.data ? (
        <div className="space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : list.isError ? (
        <p role="alert" className="text-destructive">
          Antrean payout gagal dimuat.
        </p>
      ) : list.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Tidak ada payout dengan status ini.
        </p>
      ) : (
        <div className="space-y-4">
          {list.items.map((item) => (
            <article key={item.id} className="space-y-4 rounded-xl border bg-card p-5">
              <header className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {item.jastiper.name} · {formatRupiah(item.amount)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.bankName} · {item.accountNumber} · a.n. {item.accountName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Diminta {formatDateTime(item.requestedAt)}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-muted px-3 py-1 text-sm capitalize">
                  {item.status}
                </span>
              </header>
              {item.status === "requested" && (
                <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor={`ref-${item.id}`} className="text-sm font-medium">
                      Referensi transfer
                    </label>
                    <Input
                      id={`ref-${item.id}`}
                      maxLength={100}
                      value={reference[item.id] ?? ""}
                      onChange={(event) =>
                        setReference((prev) => ({ ...prev, [item.id]: event.target.value }))
                      }
                      placeholder="Contoh: TRF-2026-001"
                    />
                    <ConfirmDialog
                      trigger={
                        <Button disabled={!reference[item.id]?.trim() || paid.isPending}>
                          Tandai dibayar
                        </Button>
                      }
                      title="Konfirmasi pembayaran payout?"
                      description={`Catat bahwa ${formatRupiah(item.amount)} sudah ditransfer ke rekening ${item.accountNumber}.`}
                      confirmLabel="Sudah ditransfer"
                      onConfirm={() =>
                        paid.mutateAsync({
                          id: item.id,
                          data: { reference: reference[item.id].trim() },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`reason-${item.id}`} className="text-sm font-medium">
                      Alasan penolakan
                    </label>
                    <Textarea
                      id={`reason-${item.id}`}
                      maxLength={500}
                      value={reason[item.id] ?? ""}
                      onChange={(event) =>
                        setReason((prev) => ({ ...prev, [item.id]: event.target.value }))
                      }
                      placeholder="Jelaskan alasan penolakan."
                    />
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="destructive"
                          disabled={!reason[item.id]?.trim() || reject.isPending}
                        >
                          Tolak payout
                        </Button>
                      }
                      title="Tolak permintaan payout?"
                      description="Permintaan ini akan ditutup dan alasan penolakan bisa dilihat jastiper."
                      confirmLabel="Ya, tolak"
                      destructive
                      onConfirm={() =>
                        reject.mutateAsync({
                          id: item.id,
                          data: { reason: reason[item.id].trim() },
                        })
                      }
                    />
                  </div>
                </div>
              )}
              {item.reference && <p className="text-sm">Referensi: {item.reference}</p>}
              {item.rejectionReason && (
                <p className="text-sm text-destructive">Alasan: {item.rejectionReason}</p>
              )}
            </article>
          ))}
        </div>
      )}
      <LoadMore
        hasNextPage={!!list.hasNextPage}
        isFetchingNextPage={list.isFetchingNextPage}
        fetchNextPage={list.fetchNextPage}
      />
    </main>
  );
}
