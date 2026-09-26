import { useLocation } from "react-router";

interface PlaceholderPageProps {
  title: string;
  module: string;
  children?: React.ReactNode;
}

/** Temporary page until the owning module implements the real one. */
export function PlaceholderPage({ title, module, children }: PlaceholderPageProps) {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          Belum diimplementasikan. Dikerjakan oleh {module}, route <code>{pathname}</code>.
        </p>
      </header>
      {children}
    </div>
  );
}
