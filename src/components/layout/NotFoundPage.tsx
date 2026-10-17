import { EmptyState } from "@/components/PageState";

export function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 sm:py-24">
      <EmptyState
        title="Halamannya nggak ketemu"
        description="Link-nya mungkin salah atau halamannya sudah dipindah. Balik ke beranda, yuk."
        action={{ label: "Kembali ke beranda", to: "/" }}
      />
    </div>
  );
}
