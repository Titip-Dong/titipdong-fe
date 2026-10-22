import { useSearchParams } from "react-router";
import { getListAuditLogsQueryKey, listAuditLogs } from "@/api/generated/endpoints/admin/admin";
import type { ListAuditLogsTargetType } from "@/api/generated/model";
import { LoadMore } from "@/components/LoadMore";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCursorList } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";

export function Component() {
  const [params, setParams] = useSearchParams();
  const targetType = (params.get("targetType") ?? "") as ListAuditLogsTargetType | "";
  const targetId = params.get("targetId") ?? "";
  const actorId = params.get("actorId") ?? "";
  const filters = {
    targetType: targetType || undefined,
    targetId: targetId || undefined,
    actorId: actorId || undefined,
    limit: 20,
  };
  const query = useCursorList(getListAuditLogsQueryKey(filters), (cursor) =>
    listAuditLogs({ ...filters, cursor }),
  );
  const change = (key: string, value: string) =>
    setParams((current) => {
      const values = Object.fromEntries(current.entries());
      if (value) values[key] = value;
      else delete values[key];
      return new URLSearchParams(values);
    });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Audit log</h1>
        <p className="mt-1 text-muted-foreground">
          Riwayat aksi sensitif, keputusan, dan perubahan akses.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Jenis target"
          className="h-10 rounded-md border bg-background px-3"
          value={targetType}
          onChange={(event) => change("targetType", event.target.value)}
        >
          <option value="">Semua target</option>
          <option value="order">Order</option>
          <option value="dispute">Sengketa</option>
          <option value="payout">Payout</option>
          <option value="user">Pengguna</option>
        </select>
        <Input
          className="max-w-xs"
          aria-label="ID target"
          placeholder="ID target"
          value={targetId}
          onChange={(event) => change("targetId", event.target.value)}
        />
        <Input
          className="max-w-xs"
          aria-label="ID pelaku"
          placeholder="ID pelaku"
          value={actorId}
          onChange={(event) => change("actorId", event.target.value)}
        />
      </div>
      {query.isPending && !query.data ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          Audit log gagal dimuat.
        </p>
      ) : query.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Belum ada catatan yang cocok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Pelaku</th>
                <th className="p-3">Target</th>
                <th className="p-3">Metadata</th>
                <th className="p-3">Request</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.items.map((entry) => (
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
                  <td className="p-3 text-xs">{entry.requestId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <LoadMore
        hasNextPage={!!query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </main>
  );
}
