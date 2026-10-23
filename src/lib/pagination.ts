import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";

interface CursorPage<TItem> {
  items: TItem[];
  nextCursor?: string;
}

/**
 * Cursor-paginated list (`{ items, nextCursor }`) for the "Muat lagi" pattern. Pass the generated
 * query key (e.g. `getListOrdersQueryKey(params)`) so invalidating that key also refreshes the list.
 */
export function useCursorList<TItem>(
  queryKey: QueryKey,
  fetchPage: (cursor: string | undefined) => Promise<CursorPage<TItem>>,
  options: { enabled?: boolean } = {},
) {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, "infinite"],
    queryFn: ({ pageParam }) => fetchPage(pageParam || undefined),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor || undefined,
    ...options,
  });
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  return { ...query, items };
}
