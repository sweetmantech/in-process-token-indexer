/**
 * Converts Unix timestamp (milliseconds) to on-chain timestamp format (seconds).
 * @param timestamp - Unix timestamp in milliseconds (number).
 * @returns On-chain timestamp in seconds (number).
 */
export function toChainTimestamp(timestamp: number): number {
  return Math.floor(timestamp / 1000);
}
