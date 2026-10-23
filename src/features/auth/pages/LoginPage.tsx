import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, type Location } from "react-router";
import type { z } from "zod";
import { useLogin } from "@/api/generated/endpoints/auth/auth";
import { LoginBody } from "@/api/generated/zod/auth/auth.zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage, setFieldErrors } from "@/lib/api-error";
import { roleHome } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "../components/AuthShell";

type LoginForm = z.infer<typeof LoginBody>;

/** Router state: `from` (set by RequireAuth) and `notice` (e.g. after a password change). */
type LoginState = { from?: Location; notice?: string } | null;

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, notice } = (location.state as LoginState) ?? {};
  const setSession = useAuthStore((s) => s.setSession);
  const login = useLogin();
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginBody),
    defaultValues: { email: "", password: "" },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((data) =>
    login.mutate(
      { data },
      {
        onSuccess: (res) => {
          setSession(res.accessToken, res.user);
          navigate(from?.pathname ?? roleHome[res.user.role], { replace: true });
        },
        onError: (err) => setFieldErrors(err, form.setError),
      },
    ),
  );

  return (
    <AuthShell
      title="Masuk"
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Daftar dulu
          </Link>
        </>
      }
    >
      {notice && (
        <p role="status" className="rounded-md bg-muted px-3 py-2 text-sm">
          {notice}
        </p>
      )}
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
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
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          {login.isError && (
            <FieldError>
              {errorMessage(login.error, {
                401: "Email atau password salah. Cek lagi, ya.",
                403: "Akun ini sedang dinonaktifkan. Hubungi admin TITIP DONG kalau menurutmu ini keliru.",
              })}
            </FieldError>
          )}
          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending ? "Sedang masuk..." : "Masuk"}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
