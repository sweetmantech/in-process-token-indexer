import turboClient from './client';
import isRetryableError from './isRetryableError';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export const uploadToArweave = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  console.log('📤 Uploading to Arweave...', mimeType);
  console.log('📊 Buffer size:', buffer.length, 'bytes');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.warn(
          `⏳ Retrying Arweave upload (attempt ${attempt}/${MAX_RETRIES})...`
        );
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }

      const { id } = await turboClient.uploadFile({
        fileStreamFactory: () => buffer,
        fileSizeFactory: () => buffer.length,
        dataItemOpts: {
          tags: [{ name: 'Content-Type', value: mimeType }],
        },
      });

      const arweaveURI = `ar://${id}`;
      console.log('✅ Arweave URI received:', arweaveURI);
      return arweaveURI;
    } catch (error) {
      if (!isRetryableError(error) || attempt === MAX_RETRIES) throw error;
      console.warn(`⚠️ Arweave upload timed out (504), will retry...`);
    }
  }

  throw new Error('Arweave upload failed after retries');
};

export default uploadToArweave;
