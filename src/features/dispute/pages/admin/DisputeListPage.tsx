import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useDecideDispute,
  useGetDispute,
  useListDisputes,
} from "@/api/generated/endpoints/admin/admin";
import { usePostDisputeMessage } from "@/api/generated/endpoints/dispute/dispute";
import type { DecideDisputeRequestDecision } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";

export function Component() {
  const client = useQueryClient();
  const [selected, setSelected] = useState("");
  const [decision, setDecision] = useState<DecideDisputeRequestDecision>("refund");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const list = useListDisputes({ status: "open", limit: 100 });
  const detail = useGetDispute(selected, { query: { enabled: Boolean(selected) } });
  const decide = useDecideDispute();
  const postMessage = usePostDisputeMessage();

  async function submitDecision() {
    if (!selected || !note.trim()) return;
    try {
      await decide.mutateAsync({ id: selected, data: { decision, note: note.trim() } });
      await client.invalidateQueries();
      toast.success(
        decision === "refund"
          ? "Sengketa diputuskan untuk refund."
          : "Sengketa diputuskan untuk pencairan.",
      );
      setSelected("");
      setNote("");
    } catch {
      toast.error("Keputusan gagal disimpan. Muat ulang data dan coba lagi.");
    }
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    try {
      await postMessage.mutateAsync({ id: selected, data: { body: message.trim() } });
      setMessage("");
      await client.invalidateQueries();
    } catch {
      toast.error("Pesan gagal dikirim.");
    }
  }

  const rows = list.data?.items ?? [];
  const current = detail.data;
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Sengketa</h1>
        <p className="mt-2 text-muted-foreground">
          Tinjau percakapan dan bukti sebelum memutuskan refund atau pencairan.
        </p>
      </header>
      {list.isPending ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : list.isError ? (
        <p className="text-destructive">Daftar sengketa gagal dimuat.</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Belum ada sengketa terbuka.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.5fr)]">
          <ul className="divide-y rounded-xl border bg-card">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  className={`w-full p-4 text-left hover:bg-muted ${row.id === selected ? "bg-muted" : ""}`}
                  onClick={() => setSelected(row.id)}
                >
                  <span className="font-semibold">{row.orderCode}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {row.category.replaceAll("_", " ")} · {formatDateTime(row.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <section className="min-w-0 space-y-5 rounded-xl border bg-card p-5">
            {!selected ? (
              <p className="text-muted-foreground">Pilih sengketa untuk melihat detail.</p>
            ) : detail.isPending ? (
              <Skeleton className="h-48" />
            ) : !current ? (
              <p className="text-destructive">Detail sengketa gagal dimuat.</p>
            ) : (
              <>
                <header>
                  <h2 className="text-2xl font-bold">{current.dispute.orderCode}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {current.order.productName} · pembeli {current.order.buyer.name} · jastiper{" "}
                    {current.order.jastiper.name}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap">{current.dispute.description}</p>
                </header>
                <div>
                  <h3 className="font-semibold">Bukti</h3>
                  {current.dispute.evidence.length ? (
                    <ul className="mt-2 flex flex-wrap gap-3">
                      {current.dispute.evidence.map((evidence) => (
                        <li key={evidence.id} className="w-32">
                          <a href={evidence.url} target="_blank" rel="noreferrer">
                            <img
                              src={evidence.url}
                              alt={evidence.note || "Bukti sengketa"}
                              className="aspect-square w-full rounded-lg border object-cover"
                            />
                          </a>
                          <p className="mt-1 text-xs">
                            {evidence.uploadedBy.name}
                            {evidence.note ? ` · ${evidence.note}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Tidak ada foto bukti.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Percakapan</h3>
                  <ol className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                    {current.dispute.messages.map((entry) => (
                      <li key={entry.id} className="rounded-lg bg-muted p-3">
                        <p className="text-xs text-muted-foreground">
                          {entry.author.name} · {formatDateTime(entry.createdAt)}
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{entry.body}</p>
                      </li>
                    ))}
                  </ol>
                  <form onSubmit={submitMessage} className="mt-3 flex gap-2">
                    <Textarea
                      aria-label="Pesan untuk pihak terkait"
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={2000}
                      placeholder="Tulis pesan untuk pembeli dan jastiper"
                    />
                    <Button disabled={!message.trim() || postMessage.isPending}>Kirim</Button>
                  </form>
                </div>
                {current.dispute.status === "open" && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold">Keputusan admin</h3>
                    <div className="flex flex-wrap gap-3">
                      <select
                        className="h-10 rounded-md border bg-background px-3"
                        value={decision}
                        onChange={(e) =>
                          setDecision(e.target.value as DecideDisputeRequestDecision)
                        }
                      >
                        <option value="refund">Refund pembeli</option>
                        <option value="release">Cairkan ke jastiper</option>
                      </select>
                      <Button onClick={submitDecision} disabled={!note.trim() || decide.isPending}>
                        {decide.isPending ? "Menyimpan..." : "Tetapkan keputusan"}
                      </Button>
                    </div>
                    <Textarea
                      maxLength={2000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Catatan keputusan yang akan dilihat kedua pihak"
                    />
                  </div>
                )}
                {current.dispute.status === "resolved" && (
                  <p className="rounded-lg bg-muted p-3">
                    Keputusan:{" "}
                    <strong>
                      {current.dispute.decision === "refund" ? "Refund" : "Pencairan"}
                    </strong>
                    {current.dispute.decisionNote && ` — ${current.dispute.decisionNote}`}
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
