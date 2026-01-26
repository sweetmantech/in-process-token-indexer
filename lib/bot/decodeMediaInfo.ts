/**
 * Decodes media info string from zero-width characters.
 * Reverses the encoding done by encodeMediaInfo.
 * @param encodedText - The encoded text with zero-width characters
 * @returns Decoded string (e.g., "MEDIA:photo:fileId123") or null if decoding fails
 */
export function decodeMediaInfo(encodedText: string): string | null {
  const ZERO_WIDTH_SPACE = '\u200B';
  const ZERO_WIDTH_JOINER = '\u200D';

  try {
    // Split by zero-width joiner to get individual character encodings
    const charEncodings = encodedText.split(ZERO_WIDTH_JOINER);

    return charEncodings
      .map(charEncoding => {
        // Convert zero-width characters back to binary
        const binary = charEncoding
          .split('')
          .map(char => (char === ZERO_WIDTH_SPACE ? '0' : '1'))
          .join('');

        // Convert binary to char code, then to character
        const charCode = parseInt(binary, 2);
        return String.fromCharCode(charCode);
      })
      .join('');
  } catch (error) {
    console.error('❌ Failed to decode media info:', error);
    return null;
  }
}
