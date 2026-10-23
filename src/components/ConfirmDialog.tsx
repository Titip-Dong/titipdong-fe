import { useRef, useState } from "react";
import { Titi, type TitiPose } from "@/components/Titi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Confirmation for destructive or final actions (cancel, reject, confirm receipt, decide a dispute).
 * Titi sits above the title: `khawatir` for destructive actions, `menunggu` otherwise, or `pose`.
 * `onConfirm` may return a promise (e.g. `mutateAsync`): the dialog stays open while it runs and closes
 * when it resolves; on rejection it stays open so the caller's error toast is shown in context.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = "Kembali",
  destructive = false,
  pose,
  onConfirm,
}: {
  trigger: React.ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  pose?: TitiPose;
  onConfirm: () => unknown;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // The caller reports the error; keep the dialog open.
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="gap-0 p-6 text-center sm:max-w-sm"
        onOpenAutoFocus={(e) => {
          // Start on the safe choice, not on the action that cannot be undone.
          e.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <Titi
          pose={pose ?? (destructive ? "khawatir" : "menunggu")}
          decorative
          still
          className="mx-auto mb-4 size-20"
        />
        <DialogTitle className="text-xl">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-balance">{description}</DialogDescription>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button
            variant={destructive ? "destructive" : "default"}
            size="lg"
            disabled={pending}
            onClick={confirm}
            className="sm:order-last"
          >
            {pending ? "Sebentar..." : confirmLabel}
          </Button>
          <DialogClose asChild>
            <Button ref={cancelRef} variant="outline" size="lg" disabled={pending}>
              {cancelLabel}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
