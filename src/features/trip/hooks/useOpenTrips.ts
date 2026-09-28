import { useInfiniteQuery } from "@tanstack/react-query";
import { getListTripsQueryKey, listTrips } from "@/api/generated/endpoints/trip/trip";

/** Open trips, paginated with the backend cursor. */
export function useOpenTrips(city: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: [...getListTripsQueryKey({ city, limit }), "infinite"],
    queryFn: ({ pageParam }) => listTrips({ city, limit, cursor: pageParam || undefined }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor || undefined,
  });
}
