import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getListAdminUsersQueryKey,
  useListAdminUsers,
  useUpdateAdminUser,
} from "@/api/generated/endpoints/admin/admin";
import type { AdminUserStatus } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export function Component() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const query = useListAdminUsers({ q: search || undefined, limit: 100 });
  const update = useUpdateAdminUser({
    mutation: {
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast.success("Status akun diperbarui.");
      },
      onError: () => toast.error("Status akun gagal diperbarui."),
    },
  });
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Pengguna</h1>
        <p className="mt-2 text-muted-foreground">Cari akun dan kelola aksesnya.</p>
      </header>
      <Input
        className="max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama atau email"
        aria-label="Cari nama atau email"
      />
      {query.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : query.isError ? (
        <p className="text-destructive">Pengguna gagal dimuat.</p>
      ) : query.data.items.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Tidak ada pengguna yang cocok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[42rem] text-left text-sm">
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
              {query.data.items.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3 capitalize">{user.status}</td>
                  <td className="p-3">{formatDate(user.createdAt)}</td>
                  <td className="p-3">
                    {user.role !== "admin" && (
                      <Button
                        size="sm"
                        variant={user.status === "active" ? "destructive" : "outline"}
                        disabled={update.isPending}
                        onClick={() =>
                          update.mutate({
                            id: user.id,
                            data: {
                              status: (user.status === "active"
                                ? "suspended"
                                : "active") as AdminUserStatus,
                            },
                          })
                        }
                      >
                        {user.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    )}
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
