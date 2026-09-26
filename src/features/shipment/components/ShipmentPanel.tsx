import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Embedded in the order detail page (F03). */
export function ShipmentPanel({ orderId }: { orderId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengiriman</CardTitle>
        <CardDescription>Placeholder F05 untuk order {orderId}.</CardDescription>
      </CardHeader>
    </Card>
  );
}
