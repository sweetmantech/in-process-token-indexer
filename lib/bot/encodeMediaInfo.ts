/**
 * Encodes media info string using zero-width characters to hide it from users.
 * Uses zero-width space (U+200B) for 0 and zero-width non-joiner (U+200C) for 1.
 * @param text - The text to encode (e.g., "MEDIA:photo:fileId123")
 * @returns Encoded string using zero-width characters
 */
export function encodeMediaInfo(text: string): string {
  // Use zero-width space (U+200B) for 0 and zero-width non-joiner (U+200C) for 1
  const ZERO_WIDTH_SPACE = '\u200B';
  const ZERO_WIDTH_NON_JOINER = '\u200C';

  // Convert each character to its char code, then to binary, then to zero-width chars
  return text
    .split('')
    .map(char => {
      const charCode = char.charCodeAt(0);
      // Convert to 16-bit binary (pad to 16 bits)
      const binary = charCode.toString(2).padStart(16, '0');
      // Convert binary to zero-width characters
      return binary
        .split('')
        .map(bit => (bit === '0' ? ZERO_WIDTH_SPACE : ZERO_WIDTH_NON_JOINER))
        .join('');
    })
    .join('\u200D'); // Use zero-width joiner (U+200D) as separator between characters
}
