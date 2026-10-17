import { Button } from "@/components/ui/button";

/** "Muat lagi" button under a cursor list; renders nothing when there is no next page. */
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}) {
  if (!hasNextPage) return null;
  return (
    <div className="flex justify-center pt-2">
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        disabled={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? "Memuat..." : "Muat lagi"}
      </Button>
    </div>
  );
}
