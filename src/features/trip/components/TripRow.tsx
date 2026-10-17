import { Link } from "react-router";
import type { TripResponse } from "@/api/generated/model";
import { formatDate, formatDateTime } from "@/lib/format";
import { countryName } from "../countries";
import { TripPhotos } from "./TripPhotos";

/** One trip in a list: destination first, then the catalog photos, then dates and capacity. */
export function TripRow({
  trip,
  to,
  status,
}: {
  trip: TripResponse;
  to: string;
  /** Shown instead of the request deadline, e.g. the trip status on the jastiper's list. */
  status?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="grid gap-4 p-4 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 sm:p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-8"
    >
      <div className="min-w-0 space-y-1">
        <p className="font-heading text-xl font-extrabold tracking-tight sm:text-2xl">
          {trip.destinationCity}
          <span className="ml-2 text-sm font-semibold text-muted-foreground">
            {countryName(trip.destinationCountry)}
          </span>
        </p>
        <p className="line-clamp-1 font-medium">{trip.title}</p>
        <p className="text-sm text-muted-foreground">
          {trip.jastiper.name}, {formatDate(trip.departsOn)} sampai {formatDate(trip.returnsOn)}
        </p>
        <div className="pt-1 text-sm">
          {status ??
            (trip.acceptsRequests ? (
              <span>
                Titip sebelum{" "}
                <span className="font-semibold">{formatDateTime(trip.requestDeadline)}</span>
                <span className="text-muted-foreground">
                  , sisa {trip.remainingCapacity} barang
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Sudah tidak menerima titipan</span>
            ))}
        </div>
      </div>
      <TripPhotos preview={trip.catalogPreview} />
    </Link>
  );
}
