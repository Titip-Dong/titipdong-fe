import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  getGetDisputeQueryKey,
  getListDisputesQueryKey,
  useDecideDispute,
  useGetDispute,
} from "@/api/generated/endpoints/admin/admin";
import type { DecideDisputeRequestDecision } from "@/api/generated/model";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";
import { formatRupiah } from "@/lib/format";
import { DisputeThread } from "../../components/DisputeThread";

export function Component() {
  const { id = "" } = useParams();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const query = useGetDispute(id);
  const decision = useDecideDispute({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          client.invalidateQueries({ queryKey: getGetDisputeQueryKey(id) }),
          client.invalidateQueries({ queryKey: getListDisputesQueryKey() }),
        ]);
        toast.success("Keputusan sengketa tersimpan.");
        navigate("/admin/disputes");
      },
      onError: (error) =>
        toast.error(errorMessage(error, { 409: "Sengketa sudah diputuskan oleh admin lain." })),
    },
  });
  if (query.isPending)
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </main>
    );
  if (query.isError || !query.data)
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-3xl font-bold">Sengketa tidak ditemukan</h1>
        <Link to="/admin/disputes">Kembali ke antrean sengketa</Link>
      </main>
    );
  const { dispute, order } = query.data;
  const choose = (value: DecideDisputeRequestDecision) =>
    decision.mutateAsync({ id, data: { decision: value, note: note.trim() } });
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <Link to="/admin/disputes" className="text-sm text-muted-foreground hover:text-foreground">
          Antrean sengketa
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Tinjau order {order.code}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          Status order <OrderStatusBadge status={order.status as never} />
          {order.total !== undefined && (
            <span className="text-sm text-muted-foreground">Nilai {formatRupiah(order.total)}</span>
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pembeli: {order.buyer.name} · Jastiper: {order.jastiper.name}
        </p>
      </header>
      <DisputeThread dispute={dispute} admin />
      {dispute.status === "open" && (
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <h2 className="text-xl font-bold">Keputusan admin</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keputusan bersifat final: refund seluruh nilai ke pembeli atau teruskan dana ke
              jastiper.
            </p>
          </div>
          <label htmlFor="decision-note" className="text-sm font-medium">
            Catatan keputusan
          </label>
          <Textarea
            id="decision-note"
            maxLength={2000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Jelaskan alasan keputusan untuk kedua pihak."
          />
          {decision.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(decision.error, {
                409: "Sengketa sudah diputuskan. Muat ulang untuk melihat hasilnya.",
              })}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <ConfirmDialog
              trigger={
                <Button variant="destructive" disabled={!note.trim() || decision.isPending}>
                  Refund pembeli
                </Button>
              }
              title="Putuskan refund?"
              description="Seluruh dana order akan dikembalikan kepada pembeli. Keputusan ini tidak bisa dibatalkan."
              confirmLabel="Ya, refund"
              destructive
              onConfirm={() => choose("refund")}
            />
            <ConfirmDialog
              trigger={<Button disabled={!note.trim() || decision.isPending}>Teruskan dana</Button>}
              title="Teruskan dana ke jastiper?"
              description="Sengketa ditutup dan dana escrow diteruskan ke jastiper. Keputusan ini tidak bisa dibatalkan."
              confirmLabel="Ya, teruskan dana"
              onConfirm={() => choose("release")}
            />
          </div>
        </section>
      )}
    </main>
  );
}
