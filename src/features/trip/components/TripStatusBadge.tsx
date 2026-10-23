import type { TripResponseStatus } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";

const status: Record<
  TripResponseStatus,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  open: { label: "Buka", variant: "default" },
  closed: { label: "Ditutup", variant: "secondary" },
  completed: { label: "Selesai", variant: "outline" },
  cancelled: { label: "Dibatalkan", variant: "outline" },
};

export function TripStatusBadge({ value }: { value: TripResponseStatus }) {
  return <Badge variant={status[value].variant}>{status[value].label}</Badge>;
}
