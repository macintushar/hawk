"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function FormatTimestamp({ timestamp }: { timestamp: Date }) {
  const formattedTimestamp = dayjs(timestamp).format("MMM D, YYYY hh:mm A");
  return (
    <div className="text-muted-foreground text-sm">{formattedTimestamp}</div>
  );
}
