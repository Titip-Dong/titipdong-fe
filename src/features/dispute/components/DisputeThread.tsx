import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlusIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import type { DisputeResponse } from "@/api/generated/model";
import { getGetDisputeQueryKey } from "@/api/generated/endpoints/admin/admin";
import {
  getGetOrderDisputeQueryKey,
  useAddDisputeEvidence,
  usePostDisputeMessage,
} from "@/api/generated/endpoints/dispute/dispute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { uploadImage } from "@/lib/upload";

export function DisputeThread({
  dispute,
  admin = false,
}: {
  dispute: DisputeResponse;
  admin?: boolean;
}) {
  const client = useQueryClient();
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: getGetOrderDisputeQueryKey(dispute.orderId) }),
      client.invalidateQueries({ queryKey: getGetDisputeQueryKey(dispute.id) }),
    ]);
  };
  const message = usePostDisputeMessage({
    mutation: {
      onSuccess: async () => {
        setBody("");
        await invalidate();
      },
      onError: () => toast.error("Pesan gagal dikirim. Sengketa mungkin sudah diputuskan."),
    },
  });
  const evidence = useAddDisputeEvidence({
    mutation: {
      onSuccess: async () => {
        setFiles([]);
        await invalidate();
        toast.success("Bukti berhasil ditambahkan.");
      },
      onError: () => toast.error("Bukti gagal ditambahkan. Coba unggah ulang."),
    },
  });

  async function addEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length || files.length > 5) return;
    setBusy(true);
    try {
      const items = await Promise.all(
        files.map(async (file) => ({ uploadId: await uploadImage(file, "dispute_evidence") })),
      );
      await evidence.mutateAsync({ id: dispute.id, data: { evidence: items } });
    } catch {
      toast.error("Bukti gagal diunggah. Periksa tipe dan ukuran foto, lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <header>
        <h2 className="text-xl font-bold">Sengketa {dispute.orderCode}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dibuka {formatDateTime(dispute.createdAt)} · {dispute.category.replaceAll("_", " ")}
        </p>
      </header>
      <p className="text-sm whitespace-pre-wrap">{dispute.description}</p>
      {dispute.evidence.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {dispute.evidence.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border p-2 text-sm hover:bg-muted"
            >
              <img
                src={item.url}
                alt={`Bukti dari ${item.uploadedBy.name}`}
                className="aspect-square w-full rounded object-cover"
              />
              <span className="mt-1 block">
                {item.uploadedBy.name}
                {item.note ? ` · ${item.note}` : ""}
              </span>
            </a>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-semibold">Percakapan</h3>
        {dispute.messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pesan.</p>
        ) : (
          <ol className="space-y-3">
            {dispute.messages.map((item) => (
              <li key={item.id} className="rounded-lg bg-muted/60 p-3">
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {item.author.name} · {item.author.role}
                  </span>
                  <time>{formatDateTime(item.createdAt)}</time>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{item.body}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
      {dispute.status === "open" && (
        <>
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (body.trim()) message.mutate({ id: dispute.id, data: { body: body.trim() } });
            }}
          >
            <label htmlFor={`message-${dispute.id}`} className="text-sm font-medium">
              Tulis pesan
            </label>
            <Textarea
              id={`message-${dispute.id}`}
              maxLength={2000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Tulis informasi yang membantu penyelesaian sengketa."
            />
            <Button size="sm" disabled={!body.trim() || message.isPending}>
              <SendIcon data-icon="inline-start" />
              Kirim pesan
            </Button>
          </form>
          {!admin && (
            <form className="space-y-2 border-t pt-4" onSubmit={(event) => void addEvidence(event)}>
              <label
                htmlFor={`evidence-${dispute.id}`}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <ImagePlusIcon className="size-4" aria-hidden />
                Tambahkan bukti (maksimal 5 foto)
              </label>
              <Input
                id={`evidence-${dispute.id}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!files.length || busy || evidence.isPending}
              >
                {busy ? "Mengunggah..." : "Unggah bukti"}
              </Button>
            </form>
          )}
        </>
      )}
      {dispute.status === "resolved" && (
        <p className="rounded-lg bg-muted p-3 text-sm">
          Keputusan:{" "}
          <strong>
            {dispute.decision === "refund" ? "Refund ke pembeli" : "Dana diteruskan ke jastiper"}
          </strong>
          {dispute.decisionNote ? ` — ${dispute.decisionNote}` : ""}
        </p>
      )}
    </section>
  );
}
