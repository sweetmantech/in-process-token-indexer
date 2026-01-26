import FormData from 'form-data';
import fetch from 'node-fetch';

export const uploadToArweave = async (file: File): Promise<string> => {
  try {
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create FormData using form-data package for Node.js
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: 'file',
      contentType: file.type,
    });

    const res = await fetch('https://inprocess.world/api/arweave', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`❌ Upload failed: ${res.status} ${res.statusText}`);
    }

    const arweaveURI = await res.json();
    return arweaveURI;
  } catch (error) {
    console.error('❌ Error uploading to Arweave:', error);
    throw error;
  }
};

export default uploadToArweave;
