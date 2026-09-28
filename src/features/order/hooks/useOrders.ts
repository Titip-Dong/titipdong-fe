import { useInfiniteQuery } from "@tanstack/react-query";
import { getListOrdersQueryKey, listOrders } from "@/api/generated/endpoints/order/order";
import type { ListOrdersParams } from "@/api/generated/model";

/** The caller's orders (as buyer or jastiper), paginated with the backend cursor. */
export function useOrders(params: Omit<ListOrdersParams, "cursor">) {
  return useInfiniteQuery({
    queryKey: [...getListOrdersQueryKey(params), "infinite"],
    queryFn: ({ pageParam }) => listOrders({ ...params, cursor: pageParam || undefined }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor || undefined,
  });
}
