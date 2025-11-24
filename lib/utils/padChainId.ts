/**
 * Pads chain ID with spaces to a maximum length of 5 characters.
 * @param chainId - Chain ID to pad (e.g., 84532 or 8453).
 * @returns Padded chain ID string (e.g., "84532" or " 8453").
 */
export function padChainId(chainId: number): string {
  return String(chainId).padStart(5, ' ');
}
