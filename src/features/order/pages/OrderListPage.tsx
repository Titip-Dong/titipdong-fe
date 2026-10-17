import { Link, useSearchParams } from "react-router";
import type { ListOrdersStatus } from "@/api/generated/model";
import { useAuthStore } from "@/stores/auth";
import { OrderList } from "../components/OrderList";

export function Component() {
  const isJastiper = useAuthStore((s) => s.hasRole("jastiper"));
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "") as ListOrdersStatus | "";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-4xl font-bold">{isJastiper ? "Titipan masuk" : "Titipan saya"}</h1>
      <OrderList
        status={status}
        onStatusChange={(s) => setParams(s ? { status: s } : {})}
        empty={
          isJastiper
            ? "Belum ada titipan di sini. Bagikan link trip kamu supaya orang mulai titip."
            : "Belum ada titipan di sini. Cari trip dan titip barang incaranmu."
        }
      />
      {!isJastiper && (
        <Link to="/trips" className="inline-block font-medium text-primary hover:underline">
          Cari trip
        </Link>
      )}
    </div>
  );
}
