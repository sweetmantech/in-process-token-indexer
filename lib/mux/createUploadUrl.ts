import fetch from 'node-fetch';
import { IN_PROCESS_API, IN_PROCESS_API_KEY } from '../consts';

const createUploadUrl = async (): Promise<{
  uploadURL: string;
  uploadId: string;
}> => {
  const response = await fetch(`${IN_PROCESS_API}/mux/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': IN_PROCESS_API_KEY,
    },
  });
  if (!response.ok) throw new Error('Failed to create Mux upload URL');
  const data = (await response.json()) as any;
  return { uploadURL: data.uploadURL, uploadId: data.uploadId };
};

export default createUploadUrl;
