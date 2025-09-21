"use client";

import dayjs from "dayjs";

import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);

export default function FormatTimestamp({ timestamp }: { timestamp: Date }) {
  const formattedTimestamp = dayjs(timestamp).format("MMM D, YYYY hh:mm A");
  return (
    <div className="text-muted-foreground text-sm">{formattedTimestamp}</div>
  );
}
