import { useEffect, useRef } from "react";

/**
 * Infinite scroll for a cursor list: loads the next page when this marker under the list comes near the viewport.
 * Renders nothing once there is no next page.
 */
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}) {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = marker.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fetchNextPage();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;
  return (
    <div ref={marker} className="py-4 text-center text-sm text-muted-foreground" aria-live="polite">
      {isFetchingNextPage ? "Memuat..." : ""}
    </div>
  );
}
