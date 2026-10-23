import { ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** One-line note next to an amount: where the money is and when it moves (DESIGN.md §9). */
export function EscrowNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground",
        className,
      )}
    >
      <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
