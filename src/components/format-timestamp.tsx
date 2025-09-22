"use client";

import dayjs from "dayjs";

import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);

function FormattedText({ text }: { text: string }) {
  return <div className="text-muted-foreground text-sm">{text}</div>;
}

export default function FormatTimestamp({
  timestamp,
  format,
}: {
  timestamp: Date | null;
  format?: string;
}) {
  if (!timestamp) return <FormattedText text="--" />;
  const formattedTimestamp = dayjs(timestamp).format(
    format ?? "MMM D, YYYY hh:mm A",
  );
  return <FormattedText text={formattedTimestamp} />;
}
