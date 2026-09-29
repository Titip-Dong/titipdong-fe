import { Link, useParams, useSearchParams } from "react-router";
import type { ListOrdersStatus } from "@/api/generated/model";
import { OrderList } from "../components/OrderList";

export function Component() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "") as ListOrdersStatus | "";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <Link to="/my-trips" className="text-sm text-muted-foreground hover:text-foreground">
          Trip saya
        </Link>
        <h1 className="text-4xl font-bold">Titipan di trip ini</h1>
      </header>
      <OrderList
        tripId={id}
        status={status}
        onStatusChange={(s) => setParams(s ? { status: s } : {})}
        empty="Belum ada titipan di trip ini. Bagikan link trip kamu supaya orang mulai titip."
      />
    </div>
  );
}
