import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import type { z } from "zod";
import { useRegister } from "@/api/generated/endpoints/auth/auth";
import { RegisterBody } from "@/api/generated/zod/auth/auth.zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { AuthCard } from "../components/AuthCard";

type RegisterForm = z.infer<typeof RegisterBody>;

const roles = [
  {
    value: "buyer",
    title: "Pembeli",
    description: "Aku mau titip barang dari luar kota atau negeri.",
  },
  {
    value: "jastiper",
    title: "Jastiper",
    description: "Aku lagi jalan-jalan dan mau buka titipan.",
  },
] as const;

export function Component() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const register = useRegister();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(RegisterBody),
    defaultValues: { name: "", email: "", password: "", role: "buyer" },
  });
  const selectedRole = useWatch({ control: form.control, name: "role" });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((data) =>
    register.mutate(
      { data },
      {
        onSuccess: (res) => {
          setSession(res.accessToken, res.user);
          navigate(res.user.role === "jastiper" ? "/my-trips" : "/trips", { replace: true });
        },
      },
    ),
  );

  return (
    <AuthCard
      title="Daftar"
      description="Buat akun TITIP DONG dalam satu menit."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">Kamu daftar sebagai</FieldLegend>
            <div className="grid gap-2 sm:grid-cols-2">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                    selectedRole === r.value && "border-primary bg-secondary",
                  )}
                >
                  <input
                    type="radio"
                    value={r.value}
                    className="sr-only"
                    {...form.register("role")}
                  />
                  <span className="block font-medium">{r.title}</span>
                  <span className="block text-sm text-muted-foreground">{r.description}</span>
                </label>
              ))}
            </div>
          </FieldSet>
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
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <FieldDescription>Minimal 8 karakter.</FieldDescription>
            <FieldError errors={[errors.password]} />
          </Field>
          {register.isError && (
            <FieldError>
              {errorMessage(register.error, {
                409: "Email ini sudah terdaftar. Pakai email lain atau masuk saja.",
              })}
            </FieldError>
          )}
          <Button type="submit" size="lg" disabled={register.isPending}>
            {register.isPending ? "Sedang mendaftar..." : "Daftar"}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
