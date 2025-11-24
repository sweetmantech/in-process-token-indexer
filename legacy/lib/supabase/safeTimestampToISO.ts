/**
 * Safely converts blockTimestamp to ISO string, using current date as fallback if invalid.
 * @param blockTimestamp - The timestamp to convert (string or number).
 * @returns ISO string representation of the timestamp, or current date if invalid.
 */
export function safeTimestampToISO(blockTimestamp?: string | number): string {
  if (blockTimestamp === null || blockTimestamp === undefined) {
    return new Date().toISOString();
  }

  const timestamp = Number(blockTimestamp);
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    return new Date().toISOString();
  }

  return new Date(timestamp * 1000).toISOString();
}
