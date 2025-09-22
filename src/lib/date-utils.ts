import dayjs from "dayjs";

/**
 * Date utilities for consistent UTC timestamp handling
 */

/**
 * Get current UTC timestamp as a Date object
 * This ensures all timestamps are stored in UTC regardless of server timezone
 */
export const utcNow = (): Date => {
  return new Date();
};

/**
 * Convert a date to UTC timestamp (milliseconds since epoch)
 * Useful for explicit UTC conversion when needed
 */
export const toUtcTimestamp = (date: Date): number => {
  return date.getTime();
};

/**
 * Create a UTC date from a timestamp
 */
export const fromUtcTimestamp = (timestamp: number): Date => {
  return new Date(timestamp);
};

/**
 * Get current UTC timestamp as ISO string
 */
export const utcNowISO = (): string => {
  return new Date().toISOString();
};

export const formatDuration = (start: Date, end?: Date | null) => {
  const endTime = end ?? new Date();
  const duration = dayjs(endTime).diff(dayjs(start));
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
