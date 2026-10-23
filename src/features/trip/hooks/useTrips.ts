import { useQueryClient } from "@tanstack/react-query";
import {
  getGetTripQueryKey,
  getListMyTripsQueryKey,
  getListTripsQueryKey,
  listMyTrips,
  listTrips,
} from "@/api/generated/endpoints/trip/trip";
import type { ListTripsParams } from "@/api/generated/model";
import { useCursorList } from "@/lib/pagination";

/** Open trips for visitors and buyers, filtered by city prefix and departure dates. */
export function useOpenTrips(params: Omit<ListTripsParams, "cursor">) {
  return useCursorList(getListTripsQueryKey(params), (cursor) => listTrips({ ...params, cursor }));
}

/** Every trip of the signed-in jastiper, newest first. */
export function useMyTrips() {
  return useCursorList(getListMyTripsQueryKey(), (cursor) => listMyTrips({ cursor }));
}

/** Refreshes every view of a trip after it or its catalog changed (docs/FLOWS.md §8). */
export function useInvalidateTrip() {
  const queryClient = useQueryClient();
  return (slug: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(slug) }),
      queryClient.invalidateQueries({ queryKey: getListMyTripsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() }),
    ]);
}
