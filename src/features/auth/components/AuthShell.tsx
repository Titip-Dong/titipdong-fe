import { Titi } from "@/components/Titi";

/** Layout for login and register: form on the right, Titi on a red panel on the left from `lg`. */
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
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:py-12">
      <aside className="hidden min-h-[32rem] items-center justify-center rounded-xl bg-primary lg:flex">
        <Titi pose="menyapa" inverted still decorative className="size-64" />
      </aside>

      <section className="w-full max-w-sm space-y-6 lg:self-center">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {children}
        <p className="text-sm text-muted-foreground">{footer}</p>
      </section>
    </div>
  );
}
