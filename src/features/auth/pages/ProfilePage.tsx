import {
  useGetCurrentUser,
  useUpdateCurrentUser,
  getGetCurrentUserQueryKey,
} from "@/api/generated/endpoints/auth/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

const roleLabel = { buyer: "Pembeli", jastiper: "Jastiper", admin: "Admin" } as const;

export function Component() {
  const { data: user, isPending } = useGetCurrentUser();
  const client = useQueryClient();
  const update = useUpdateCurrentUser();
  const [name, setName] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string } =
      {};
    if (name !== undefined && name.trim() !== user?.name) data.name = name.trim();
    if (phone !== undefined && phone !== (user?.phone ?? "")) data.phone = phone;
    if (newPassword) {
      data.currentPassword = currentPassword;
      data.newPassword = newPassword;
    }
    if (!Object.keys(data).length) {
      toast.info("Belum ada perubahan untuk disimpan.");
      return;
    }
    try {
      const fresh = await update.mutateAsync({ data });
      await client.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      const token = useAuthStore.getState().accessToken;
      if (token) useAuthStore.getState().setSession(token, fresh);
      setName(fresh.name);
      setPhone(fresh.phone ?? "");
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profil berhasil diperbarui.");
    } catch {
      toast.error("Profil gagal diperbarui. Periksa kata sandi saat ini dan isianmu.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-4xl font-bold">Profil</h1>
      {isPending || !user ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <>
          <dl className="divide-y rounded-2xl border bg-card">
            {[
              ["Nama", user.name],
              ["Email", user.email],
              ["Peran", roleLabel[user.role]],
              ["Bergabung", formatDate(user.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 p-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5">
            <h2 className="text-xl font-bold">Ubah profil</h2>
            <Field>
              <FieldLabel htmlFor="profileName">Nama</FieldLabel>
              <Input
                id="profileName"
                required
                maxLength={100}
                value={name ?? user.name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profilePhone">Nomor telepon</FieldLabel>
              <Input
                id="profilePhone"
                maxLength={20}
                pattern="\+?[0-9]*"
                value={phone ?? user.phone ?? ""}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Opsional"
              />
            </Field>
            <div className="border-t pt-4">
              <h3 className="font-semibold">Ganti kata sandi (opsional)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kamu perlu masuk lagi di perangkat lain setelah menggantinya.
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="currentPassword">Kata sandi saat ini</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={Boolean(newPassword)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">Kata sandi baru</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Button disabled={update.isPending}>
              {update.isPending ? "Menyimpan..." : "Simpan profil"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
