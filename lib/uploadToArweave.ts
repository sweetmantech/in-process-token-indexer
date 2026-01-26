import FormData from 'form-data';
import fetch from 'node-fetch';

export const uploadToArweave = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  try {
    console.log('ziad here');
    // Create FormData using form-data package for Node.js
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: 'file',
      contentType: mimeType,
    });

    console.log('📤 Uploading to Arweave...', mimeType);
    console.log('📊 Buffer size:', buffer.length, 'bytes');

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      console.log('🌐 Sending request to https://inprocess.world/api/arweave');
      const res = await fetch('https://inprocess.world/api/arweave', {
        method: 'POST',
        headers: formData.getHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('✅ Upload response received:', res.status);

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(
          `❌ Upload failed: ${res.status} ${res.statusText} - ${errorText}`
        );
      }

      const arweaveURI = await res.json();
      console.log('✅ Arweave URI received:', arweaveURI);
      return arweaveURI;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error(
          '❌ Upload timeout: Request took longer than 60 seconds'
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Error uploading to Arweave:', error);
    throw error;
  }
};

export default uploadToArweave;
