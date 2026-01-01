import { appendFile } from 'fs/promises';
import { join } from 'path';

/**
 * Writes an error message to error.log.txt file.
 * @param message - Error message to write.
 * @param error - Error object (optional).
 */
export async function writeErrorToFile(
  message: string,
  error?: unknown
): Promise<void> {
  const timestamp = new Date().toISOString();
  const errorLogPath = join(process.cwd(), 'error.log.txt');

  let logEntry = `[${timestamp}] ${message}\n`;

  if (error) {
    const errorString =
      error instanceof Error
        ? `${error.message}\n${error.stack || ''}`
        : String(error);
    logEntry += `  Error: ${errorString}\n`;
  }

  logEntry += '\n';

  try {
    await appendFile(errorLogPath, logEntry, 'utf-8');
  } catch (writeError) {
    console.error('❌ Failed to write error to file:', writeError);
  }
}
