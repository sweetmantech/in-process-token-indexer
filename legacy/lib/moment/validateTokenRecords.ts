export interface TokenRecord {
  id: string;
  address: string;
  chainId: number;
  [key: string]: unknown;
}

/**
 * Validates that an unknown value is a valid TokenRecord.
 * @param value - The value to validate.
 * @returns true if the value is a valid TokenRecord, false otherwise.
 */
export function isValidTokenRecord(value: unknown): value is TokenRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  // Check that id exists and is a string
  if (typeof record.id !== 'string' || record.id.length === 0) {
    return false;
  }

  // Check that address exists and is a string
  if (typeof record.address !== 'string' || record.address.length === 0) {
    return false;
  }

  // Check that chainId exists and is a number
  if (typeof record.chainId !== 'number' || !Number.isInteger(record.chainId)) {
    return false;
  }

  return true;
}

/**
 * Validates an array of unknown values and returns only valid TokenRecords.
 * Throws an error if any invalid entries are found.
 * @param data - Array of unknown values to validate.
 * @returns Array of validated TokenRecord objects.
 * @throws Error if any invalid entries are found.
 */
export function validateTokenRecords(data: unknown[]): TokenRecord[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected data to be an array');
  }

  const validRecords: TokenRecord[] = [];
  const invalidIndices: number[] = [];

  data.forEach((item, index) => {
    if (isValidTokenRecord(item)) {
      validRecords.push(item);
    } else {
      invalidIndices.push(index);
    }
  });

  if (invalidIndices.length > 0) {
    throw new Error(
      `Invalid token records found at indices: ${invalidIndices.join(', ')}. ` +
        'Each record must have id (string), address (string), and chainId (number) properties.'
    );
  }

  return validRecords;
}
