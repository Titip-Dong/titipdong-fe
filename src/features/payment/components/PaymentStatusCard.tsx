import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Embedded in the order detail page (F03). */
export function PaymentStatusCard({ orderId }: { orderId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Pembayaran</CardTitle>
        <CardDescription>Placeholder F04 untuk order {orderId}.</CardDescription>
      </CardHeader>
    </Card>
  );
}
