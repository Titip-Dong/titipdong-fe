import { Titi } from "@/components/Titi";

/** Layout for login and register: form on the right, a large Titi on the left from `lg`. */
export function AuthShell({
  title,
  footer,
  children,
}: {
  title: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-[5fr_7fr] lg:content-center lg:items-center lg:gap-16 lg:py-12">
      <aside className="hidden items-center justify-center lg:flex">
        <Titi pose="menyapa" still decorative className="size-64" />
      </aside>

      <section className="w-full max-w-sm space-y-6 lg:self-center">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {children}
        <p className="text-sm text-muted-foreground">{footer}</p>
      </section>
    </div>
  );
}
