import { ShieldCheckIcon } from "lucide-react";
import { Link } from "react-router";
import { useGetWallet } from "@/api/generated/endpoints/payment/payment";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/format";

export function Component() {
  const { data, isPending, isError } = useGetWallet();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-4xl font-bold">Saldo</h1>
      <section className="space-y-2 rounded-2xl border bg-card p-6">
        <p className="text-muted-foreground">Pendapatan yang sudah cair</p>
        {isPending ? (
          <Skeleton className="h-10 w-48" />
        ) : isError ? (
          <p className="text-destructive">Saldo gagal dimuat. Muat ulang halaman, ya.</p>
        ) : (
          <p className="text-4xl font-bold tabular-nums">{formatRupiah(data.balance)}</p>
        )}
      </section>
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Dana titipan masuk ke saldo setelah pembeli mengonfirmasi barang diterima, dipotong biaya
        layanan 5%. Pencairan ke rekening bank belum tersedia di versi ini.
      </p>
      <Link to="/orders" className="inline-block font-medium text-primary hover:underline">
        Lihat titipan masuk
      </Link>
    </div>
  );
}
