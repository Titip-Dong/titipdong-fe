import { ShieldCheckIcon } from "lucide-react";

/** Centered card shared by the login and register pages. */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <div className="space-y-6 rounded-2xl border bg-card p-6 sm:p-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </header>
        {children}
        <p className="text-sm text-muted-foreground">{footer}</p>
      </div>
      <p className="mt-4 flex items-start gap-2 px-2 text-sm text-muted-foreground">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Setiap pembayaran ditahan TITIP DONG sampai barang diterima pembeli.
      </p>
    </div>
  );
}
