import { cn } from "@/lib/utils";

/**
 * The page's main action. On phones it sticks to the bottom of the screen, above the bottom
 * navigation (`--bottom-nav-height` from MainLayout); from `md` it sits inline after the content.
 */
export function ActionBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-(--bottom-nav-height,0px) z-30 -mx-4 flex gap-3 border-t bg-card px-4 py-3 sm:-mx-6 sm:px-6 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 [&>*]:flex-1 md:[&>*]:flex-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
