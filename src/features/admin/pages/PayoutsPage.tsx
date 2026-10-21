import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getListPayoutsQueryKey,
  useListPayouts,
  useMarkPayoutPaid,
  useRejectPayout,
} from "@/api/generated/endpoints/admin/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRupiah } from "@/lib/format";

export function Component() {
  const client = useQueryClient();
  const [reference, setReference] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  const query = useListPayouts({ status: "requested", limit: 100 });
  const paid = useMarkPayoutPaid({
    mutation: {
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: getListPayoutsQueryKey() });
        toast.success("Payout ditandai sudah dibayar.");
      },
      onError: () => toast.error("Payout gagal diperbarui."),
    },
  });
  const reject = useRejectPayout({
    mutation: {
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: getListPayoutsQueryKey() });
        toast.success("Permintaan payout ditolak.");
      },
      onError: () => toast.error("Payout gagal diperbarui."),
    },
  });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Payout jastiper</h1>
        <p className="mt-2 text-muted-foreground">
          Lakukan transfer melalui bank, lalu catat hasilnya di sini.
        </p>
      </header>
      {query.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : query.isError ? (
        <p className="text-destructive">Permintaan payout gagal dimuat.</p>
      ) : query.data.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Tidak ada payout yang menunggu keputusan.
        </p>
      ) : (
        <div className="space-y-4">
          {query.data.items.map((p) => (
            <article key={p.id} className="space-y-4 rounded-xl border bg-card p-5">
              <header className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">
                    {p.jastiper.name} · {formatRupiah(p.amount)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Diminta {formatDateTime(p.requestedAt)}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-muted px-3 py-1 text-sm">{p.status}</span>
              </header>
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Bank</dt>
                  <dd>{p.bankName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Nomor rekening</dt>
                  <dd className="font-mono">{p.accountNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Nama rekening</dt>
                  <dd>{p.accountName}</dd>
                </div>
              </dl>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex gap-2">
                  <Input
                    aria-label={`Referensi transfer untuk ${p.jastiper.name}`}
                    maxLength={100}
                    value={reference[p.id] ?? ""}
                    onChange={(e) => setReference((old) => ({ ...old, [p.id]: e.target.value }))}
                    placeholder="Referensi transfer"
                  />
                  <Button
                    disabled={!reference[p.id]?.trim() || paid.isPending}
                    onClick={() =>
                      paid.mutate({ id: p.id, data: { reference: reference[p.id].trim() } })
                    }
                  >
                    Tandai dibayar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    aria-label={`Alasan penolakan untuk ${p.jastiper.name}`}
                    maxLength={500}
                    value={reason[p.id] ?? ""}
                    onChange={(e) => setReason((old) => ({ ...old, [p.id]: e.target.value }))}
                    placeholder="Alasan penolakan"
                  />
                  <Button
                    variant="outline"
                    disabled={!reason[p.id]?.trim() || reject.isPending}
                    onClick={() =>
                      reject.mutate({ id: p.id, data: { reason: reason[p.id].trim() } })
                    }
                  >
                    Tolak
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
