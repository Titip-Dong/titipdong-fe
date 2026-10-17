import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
  useUpdateCurrentUser,
} from "@/api/generated/endpoints/auth/auth";
import type { UserResponse } from "@/api/generated/model";
import { UpdateCurrentUserBody } from "@/api/generated/zod/auth/auth.zod";
import { ErrorState } from "@/components/PageState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, setFieldErrors } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "../hooks/useLogout";

const ProfileForm = UpdateCurrentUserBody.pick({ name: true, phone: true }).required({
  name: true,
});
const PasswordForm = UpdateCurrentUserBody.pick({ newPassword: true })
  .required()
  .extend({ currentPassword: z.string().min(1, "Isi password kamu yang sekarang.") });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t pt-8">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

function ProfileDetails({ user }: { user: UserResponse }) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const update = useUpdateCurrentUser();
  const form = useForm<z.infer<typeof ProfileForm>>({
    resolver: zodResolver(ProfileForm),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((data) =>
    update.mutate(
      { data },
      {
        onSuccess: (res) => {
          setUser(res);
          queryClient.setQueryData(getGetCurrentUserQueryKey(), res);
          form.reset({ name: res.name, phone: res.phone ?? "" });
          toast.success("Data diri disimpan.");
        },
        onError: (err) => {
          if (!setFieldErrors(err, form.setError)) toast.error(errorMessage(err));
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Nomor HP (opsional)</FieldLabel>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Contoh: 081234567890"
            aria-invalid={!!errors.phone}
            {...form.register("phone")}
          />
          <FieldDescription>
            Hanya angka, boleh diawali +. Kosongkan untuk menghapus.
          </FieldDescription>
          <FieldError errors={[errors.phone]} />
        </Field>
        <Button
          type="submit"
          className="w-full sm:w-fit"
          disabled={!form.formState.isDirty || update.isPending}
        >
          {update.isPending ? "Menyimpan..." : "Simpan data diri"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function ChangePassword() {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const update = useUpdateCurrentUser();
  const form = useForm<z.infer<typeof PasswordForm>>({
    resolver: zodResolver(PasswordForm),
    defaultValues: { currentPassword: "", newPassword: "" },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((data) =>
    update.mutate(
      { data },
      {
        // The backend signs out every device after a password change, this one included.
        onSuccess: () => {
          clear();
          queryClient.clear();
          navigate("/login", {
            replace: true,
            state: { notice: "Password sudah diganti. Masuk lagi pakai password baru, ya." },
          });
        },
        onError: (err) => {
          if (err.status === 401) {
            form.setError("currentPassword", {
              type: "server",
              message: "Password yang sekarang salah. Cek lagi, ya.",
            });
          } else if (!setFieldErrors(err, form.setError)) {
            toast.error(errorMessage(err));
          }
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.currentPassword}>
          <FieldLabel htmlFor="current-password">Password sekarang</FieldLabel>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            {...form.register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>
        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="new-password">Password baru</FieldLabel>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...form.register("newPassword")}
          />
          <FieldDescription>
            Minimal 8 karakter. Setelah diganti, kamu perlu masuk lagi di semua perangkat.
          </FieldDescription>
          <FieldError errors={[errors.newPassword]} />
        </Field>
        <Button
          type="submit"
          variant="secondary"
          className="w-full sm:w-fit"
          disabled={update.isPending}
        >
          {update.isPending ? "Mengganti..." : "Ganti password"}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function Component() {
  const { data: user, isPending, isError, refetch } = useGetCurrentUser();
  const logout = useLogout();

  return (
    <div className="mx-auto w-full max-w-xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-3xl sm:text-4xl">Profil</h1>

      {isPending ? (
        <div className="space-y-4" aria-busy>
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          description="Profil kamu gagal dimuat. Coba lagi sebentar lagi, ya."
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-xl">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-lg font-bold">{user.name}</p>
                <Badge variant="secondary">{roleLabel[user.role]}</Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Bergabung {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          <Section title="Data diri">
            <ProfileDetails user={user} />
          </Section>

          <Section title="Ganti password">
            <ChangePassword />
          </Section>

          <Section title="Keluar">
            <p className="text-sm text-muted-foreground">Keluar dari akun ini di perangkat ini.</p>
            <Button variant="outline" className="w-full sm:w-fit" onClick={() => void logout()}>
              Keluar
            </Button>
          </Section>
        </>
      )}
    </div>
  );
}
