import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, type Location } from "react-router";
import type { z } from "zod";
import { useLogin } from "@/api/generated/endpoints/auth/auth";
import { LoginBody } from "@/api/generated/zod/auth/auth.zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api-error";
import { roleHome } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth";
import { AuthCard } from "../components/AuthCard";

type LoginForm = z.infer<typeof LoginBody>;

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname;
  const setSession = useAuthStore((s) => s.setSession);
  const login = useLogin();
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginBody),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) =>
    login.mutate(
      { data },
      {
        onSuccess: (res) => {
          setSession(res.accessToken, res.user);
          navigate(from ?? roleHome[res.user.role], { replace: true });
        },
      },
    ),
  );

  return (
    <AuthCard
      title="Masuk"
      description="Masuk untuk titip barang atau mengelola trip kamu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Daftar dulu
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>
          {login.isError && (
            <FieldError>
              {errorMessage(login.error, { 401: "Email atau password salah. Cek lagi, ya." })}
            </FieldError>
          )}
          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending ? "Sedang masuk..." : "Masuk"}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
