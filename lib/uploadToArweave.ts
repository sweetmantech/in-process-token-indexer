import FormData from 'form-data';
import axios from 'axios';

export const uploadToArweave = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  try {
    console.log('📤 Uploading to Arweave...', mimeType);
    console.log('📊 Buffer size:', buffer.length, 'bytes');

    // Create FormData using form-data package for Node.js
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: 'file',
      contentType: mimeType,
    });

    const res = await axios.post(
      'https://inprocess.world/api/arweave',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const arweaveURI = res.data;
    console.log('✅ Arweave URI received:', arweaveURI);
    return arweaveURI;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('❌ Upload timeout: Request took longer than 60 seconds');
    }
    if (error.response) {
      throw new Error(
        `❌ Upload failed: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`
      );
    }
    console.error('❌ Error uploading to Arweave:', error);
    throw error;
  }
};

export default uploadToArweave;
