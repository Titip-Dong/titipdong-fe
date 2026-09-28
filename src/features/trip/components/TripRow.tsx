import { Link } from "react-router";
import type { TripResponse } from "@/api/generated/model";
import { formatDate, formatDateTime } from "@/lib/format";
import { countryName } from "../countries";

/** One trip in a list: destination first, then who is going and until when you can titip. */
export function TripRow({
  trip,
  to,
  aside,
}: {
  trip: TripResponse;
  to: string;
  aside?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-3 p-4 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-heading text-2xl font-bold tracking-tight">
          {trip.destinationCity}
          <span className="ml-2 text-base font-medium text-muted-foreground">
            {countryName(trip.destinationCountry)}
          </span>
        </p>
        <p className="line-clamp-1 font-medium">{trip.title}</p>
        <p className="text-sm">
          Bersama <span className="font-medium">{trip.jastiper.name}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDate(trip.departsOn)} sampai {formatDate(trip.returnsOn)}
        </p>
      </div>
      <div className="text-sm sm:w-44 sm:text-right">
        {aside ??
          (trip.acceptsRequests ? (
            <span className="text-muted-foreground">
              Titip sebelum{" "}
              <span className="text-foreground">{formatDateTime(trip.requestDeadline)}</span>
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              Sudah tutup
            </span>
          ))}
      </div>
    </Link>
  );
}
