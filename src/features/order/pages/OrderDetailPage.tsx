import { useParams } from "react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { PaymentStatusCard } from "@/features/payment";
import { ShipmentPanel } from "@/features/shipment";

export function Component() {
  const { id = "" } = useParams();

  return (
    <PlaceholderPage title="Detail Order" module="F03 Order">
      <PaymentStatusCard orderId={id} />
      <ShipmentPanel orderId={id} />
    </PlaceholderPage>
  );
}
