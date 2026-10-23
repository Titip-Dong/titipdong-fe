import { Link } from "react-router";
import { Titi, type TitiPose } from "@/components/Titi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Action = { label: string; to: string } | { label: string; onClick: () => void };

function ActionButton({ action }: { action: Action }) {
  if ("to" in action) {
    return (
      <Button asChild className="w-full @lg:w-auto">
        <Link to={action.to}>{action.label}</Link>
      </Button>
    );
  }
  return (
    <Button onClick={action.onClick} className="w-full @lg:w-auto">
      {action.label}
    </Button>
  );
}

/** Empty, error, or not-found block with Titi; stacked in narrow containers, side by side in wide ones. */
export function PageState({
  pose,
  title,
  description,
  action,
  className,
}: {
  pose: TitiPose;
  title: string;
  description?: string;
  action?: Action;
  className?: string;
}) {
  return (
    <div className={cn("@container rounded-xl border bg-card", className)}>
      <div className="flex flex-col items-center gap-4 p-6 text-center @lg:flex-row @lg:gap-8 @lg:p-8 @lg:text-left">
        <Titi pose={pose} decorative className="size-24 shrink-0 @lg:size-32" />
        <div className="flex w-full flex-col items-center gap-3 @lg:items-start">
          <h2 className="text-xl">{title}</h2>
          {description && (
            <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
          )}
          {action && <ActionButton action={action} />}
        </div>
      </div>
    </div>
  );
}

export function EmptyState(props: Omit<React.ComponentProps<typeof PageState>, "pose">) {
  return <PageState pose="bingung" {...props} />;
}

export function ErrorState({
  title = "Ada yang tidak beres",
  description = "Datanya gagal dimuat. Coba lagi sebentar lagi, ya.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <PageState
      pose="khawatir"
      title={title}
      description={description}
      action={onRetry && { label: "Coba lagi", onClick: onRetry }}
      className={className}
    />
  );
}

/** Loading placeholder for card lists; matches the height of a card with a photo. */
export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("grid gap-3", className)} aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <Skeleton className="size-14 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
