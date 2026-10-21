import { useState } from "react";
import { useListAuditLogs } from "@/api/generated/endpoints/admin/admin";
import type { ListAuditLogsTargetType } from "@/api/generated/model";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";

const targets: { value: ListAuditLogsTargetType | ""; label: string }[] = [
  { value: "", label: "Semua target" },
  { value: "order", label: "Order" },
  { value: "dispute", label: "Sengketa" },
  { value: "payout", label: "Payout" },
  { value: "user", label: "Pengguna" },
];

export function Component() {
  const [targetType, setTargetType] = useState<ListAuditLogsTargetType | "">("");
  const [targetId, setTargetId] = useState("");
  const query = useListAuditLogs({
    targetType: targetType || undefined,
    targetId: targetId || undefined,
    limit: 100,
  });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Audit log</h1>
        <p className="mt-2 text-muted-foreground">Riwayat aksi sensitif dan keputusan admin.</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Jenis target"
          className="h-10 rounded-md border bg-background px-3"
          value={targetType}
          onChange={(e) => setTargetType(e.target.value as ListAuditLogsTargetType | "")}
        >
          {targets.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <Input
          className="max-w-sm"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="ID target"
          aria-label="ID target"
        />
      </div>
      {query.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : query.isError ? (
        <p className="text-destructive">Audit log gagal dimuat.</p>
      ) : query.data.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Belum ada catatan yang cocok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Pelaku</th>
                <th className="p-3">Target</th>
                <th className="p-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.data.items.map((entry) => (
                <tr key={entry.id}>
                  <td className="p-3 whitespace-nowrap">{formatDateTime(entry.createdAt)}</td>
                  <td className="p-3">{entry.action}</td>
                  <td className="p-3">{entry.actorName ?? entry.actorType}</td>
                  <td className="p-3">
                    {entry.targetType} · {entry.targetId}
                  </td>
                  <td className="max-w-sm p-3">
                    <pre className="overflow-x-auto text-xs whitespace-pre-wrap">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
