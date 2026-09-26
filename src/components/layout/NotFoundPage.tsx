import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Halaman yang kamu cari tidak ditemukan.</p>
      <Button asChild>
        <Link to="/">Kembali ke beranda</Link>
      </Button>
    </div>
  );
}
