import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useApproveOrder, useRejectOrder } from "@/api/generated/endpoints/order/order";
import { ApproveOrderBody } from "@/api/generated/zod/order/order.zod";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";

type ApproveValues = z.infer<typeof ApproveOrderBody>;

const conflict = { 409: "Titipan ini sudah diproses." };

/** Jastiper approves a requested order with a price, or rejects it with a reason. */
export function DecisionPanel({
  orderId,
  quantity,
  onDone,
}: {
  orderId: string;
  quantity: number;
  onDone: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const approve = useApproveOrder({
    mutation: {
      onSuccess: () => {
        toast.success("Titipan disetujui. Pembeli tinggal membayar.");
        onDone();
      },
    },
  });
  const reject = useRejectOrder({
    mutation: {
      onSuccess: () => {
        toast.success("Titipan ditolak.");
        onDone();
      },
      onError: (err) => toast.error(errorMessage(err, conflict)),
    },
  });
  const form = useForm<ApproveValues>({ resolver: zodResolver(ApproveOrderBody) });
  const errors = form.formState.errors;

  if (rejecting) {
    return (
      <form className="w-full space-y-3">
        <Field>
          <FieldLabel htmlFor="reason">Alasan menolak</FieldLabel>
          <Textarea
            id="reason"
            rows={2}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: barangnya sudah tidak dijual di sana."
          />
          <FieldDescription>Alasan ini ditampilkan ke pembeli.</FieldDescription>
        </Field>
        <div className="flex flex-wrap gap-2">
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="destructive"
                disabled={!reason.trim() || reject.isPending}
              >
                Tolak titipan
              </Button>
            }
            title="Tolak permintaan titipan?"
            description="Pembeli akan menerima alasan penolakan ini dan order tidak bisa dipulihkan."
            confirmLabel="Ya, tolak titipan"
            destructive
            onConfirm={() => reject.mutateAsync({ id: orderId, data: { reason: reason.trim() } })}
          />
          <Button type="button" variant="ghost" onClick={() => setRejecting(false)}>
            Batal
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="w-full space-y-4"
      noValidate
      onSubmit={form.handleSubmit((data) => approve.mutate({ id: orderId, data }))}
    >
      <p className="font-heading text-lg font-semibold">Tentukan harga</p>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.itemPrice}>
            <FieldLabel htmlFor="itemPrice">Harga barang per unit (Rp)</FieldLabel>
            <Input
              id="itemPrice"
              type="number"
              inputMode="numeric"
              min={1}
              aria-invalid={!!errors.itemPrice}
              {...form.register("itemPrice", { valueAsNumber: true })}
            />
            <FieldDescription>Pembeli titip {quantity} barang.</FieldDescription>
            <FieldError errors={[errors.itemPrice]} />
          </Field>
          <Field data-invalid={!!errors.jastipFee}>
            <FieldLabel htmlFor="jastipFee">Fee jastip untuk seluruh titipan (Rp)</FieldLabel>
            <Input
              id="jastipFee"
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={!!errors.jastipFee}
              {...form.register("jastipFee", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.jastipFee]} />
          </Field>
        </div>
        {approve.isError && <FieldError>{errorMessage(approve.error, conflict)}</FieldError>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={approve.isPending}>
            {approve.isPending ? "Menyimpan..." : "Setujui titipan"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setRejecting(true)}>
            Tolak
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
