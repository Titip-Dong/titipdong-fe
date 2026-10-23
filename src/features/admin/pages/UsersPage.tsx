import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getListAdminUsersQueryKey,
  listAdminUsers,
  useUpdateAdminUser,
} from "@/api/generated/endpoints/admin/admin";
import type { ListAdminUsersRole, ListAdminUsersStatus } from "@/api/generated/model";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadMore } from "@/components/LoadMore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCursorList } from "@/lib/pagination";
import { formatDate } from "@/lib/format";

export function Component() {
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const role = (params.get("role") ?? "") as ListAdminUsersRole | "";
  const status = (params.get("status") ?? "") as ListAdminUsersStatus | "";
  const filters = {
    q: q || undefined,
    role: role || undefined,
    status: status || undefined,
    limit: 20,
  };
  const query = useCursorList(getListAdminUsersQueryKey(filters), (cursor) =>
    listAdminUsers({ ...filters, cursor }),
  );
  const update = useUpdateAdminUser({
    mutation: {
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast.success("Status akun diperbarui.");
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Status akun gagal diperbarui."),
    },
  });
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
        <h1 className="text-3xl font-bold">Pengguna</h1>
        <p className="mt-1 text-muted-foreground">Cari akun dan kelola status aksesnya.</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          aria-label="Cari nama atau email"
          placeholder="Cari nama atau email"
          value={q}
          onChange={(event) => change("q", event.target.value)}
        />
        <select
          aria-label="Filter peran"
          className="h-10 rounded-md border bg-background px-3"
          value={role}
          onChange={(event) => change("role", event.target.value)}
        >
          <option value="">Semua peran</option>
          <option value="buyer">Pembeli</option>
          <option value="jastiper">Jastiper</option>
          <option value="admin">Admin</option>
        </select>
        <select
          aria-label="Filter status"
          className="h-10 rounded-md border bg-background px-3"
          value={status}
          onChange={(event) => change("status", event.target.value)}
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Dinonaktifkan</option>
        </select>
      </div>
      {query.isPending && !query.data ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          Daftar pengguna gagal dimuat.
        </p>
      ) : query.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Tidak ada pengguna yang cocok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[50rem] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Email</th>
                <th className="p-3">Peran</th>
                <th className="p-3">Status</th>
                <th className="p-3">Bergabung</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.items.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3 capitalize">
                    {user.status === "active" ? "Aktif" : "Dinonaktifkan"}
                  </td>
                  <td className="p-3">{formatDate(user.createdAt)}</td>
                  <td className="p-3">
                    {user.role !== "admin" && (
                      <ConfirmDialog
                        trigger={
                          <Button
                            size="sm"
                            variant={user.status === "active" ? "destructive" : "outline"}
                            disabled={update.isPending}
                          >
                            {user.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        }
                        title={user.status === "active" ? "Nonaktifkan akun?" : "Aktifkan akun?"}
                        description={
                          user.status === "active"
                            ? `Akun ${user.email} tidak bisa masuk lagi setelah sesi berikutnya.`
                            : `Akun ${user.email} bisa masuk kembali setelah diaktifkan.`
                        }
                        confirmLabel={user.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                        destructive={user.status === "active"}
                        onConfirm={() =>
                          update.mutateAsync({
                            id: user.id,
                            data: { status: user.status === "active" ? "suspended" : "active" },
                          })
                        }
                      />
                    )}
                  </td>
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
