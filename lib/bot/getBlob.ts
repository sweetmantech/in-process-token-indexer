import { getBot } from './bot';
import { TELEGRAM_BOT_API_KEY, TELEGRAM_LOCAL_API_URL } from '@/lib/consts';
import fetch from 'node-fetch';
import getMimeType from './getMimeType';

/**
 * Downloads a file from Telegram and returns it as a Buffer blob with MIME type.
 * @param fileId - The Telegram file ID to download.
 * @returns A Promise that resolves to an object with blob and mimeType, or null if download fails.
 */
export async function getBlob(
  fileId: string
): Promise<{ blob: fetch.Blob; mimeType: string }> {
  const bot = getBot();
  if (!bot) {
    throw new Error('❌ Bot instance is not available');
  }

  try {
    // Get file info from Telegram
    const file = await bot.getFile(fileId);
    if (!file || !file.file_path)
      throw new Error(`❌ Failed to get file info for fileId: ${fileId}`);

    // Get MIME type from file extension
    const mimeType = getMimeType(file.file_path);

    // Construct download URL
    const fileUrl = `${TELEGRAM_LOCAL_API_URL}/file/bot${TELEGRAM_BOT_API_KEY}/${file.file_path}`;

    // Download the file
    console.log(
      `📥 Downloading file from Telegram: ${file.file_path} (${mimeType})`
    );
    const response = await fetch(fileUrl);

    if (!response.ok)
      throw new Error(
        `❌ Failed to download file: ${response.status} ${response.statusText}`
      );

    const blob = await response.blob();

    return { blob, mimeType };
  } catch (error) {
    throw new Error(
      `❌ Error downloading file with fileId ${fileId}: ${error}`
    );
  }
}
