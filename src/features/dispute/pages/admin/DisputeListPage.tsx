import { Link, useSearchParams } from "react-router";
import { getListDisputesQueryKey, listDisputes } from "@/api/generated/endpoints/admin/admin";
import type { ListDisputesStatus } from "@/api/generated/model";
import { LoadMore } from "@/components/LoadMore";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { useCursorList } from "@/lib/pagination";

export function Component() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "open") as ListDisputesStatus;
  const filters = { status, limit: 20 };
  const query = useCursorList(getListDisputesQueryKey(filters), (cursor) =>
    listDisputes({ ...filters, cursor }),
  );
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Sengketa</h1>
        <p className="mt-1 text-muted-foreground">
          Tinjau bukti dan percakapan, lalu putuskan refund atau pencairan.
        </p>
      </header>
      <div className="flex gap-2" role="group" aria-label="Filter status sengketa">
        {(["open", "resolved"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => setParams({ status: value })}
            className={`rounded-full border px-4 py-2 text-sm ${status === value ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            {value === "open" ? "Terbuka" : "Selesai"}
          </button>
        ))}
      </div>
      {query.isPending && !query.data ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          Daftar sengketa gagal dimuat.
        </p>
      ) : query.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          {status === "open" ? "Belum ada sengketa terbuka." : "Belum ada sengketa yang selesai."}
        </p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {query.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">
                  Order {item.orderCode} · {item.category.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dibuka {formatDateTime(item.createdAt)}
                  {item.decision
                    ? ` · ${item.decision === "refund" ? "Refund" : "Dana dicairkan"}`
                    : ""}
                </p>
              </div>
              <Link
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                to={`/admin/disputes/${item.id}`}
              >
                Tinjau sengketa
              </Link>
            </li>
          ))}
        </ul>
      )}
      <LoadMore
        hasNextPage={!!query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </main>
  );
}
