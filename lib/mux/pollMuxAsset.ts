import fetch from 'node-fetch';
import { IN_PROCESS_API } from '../consts';
import { MuxUploadResult } from './uploadVideoToMux';

const pollMuxAsset = async (uploadId: string): Promise<MuxUploadResult> => {
  if (!IN_PROCESS_API) throw new Error('IN_PROCESS_API is not set');

  const maxRetries = 60;
  const delayMs = 3000;

  for (let i = 0; i < maxRetries; i++) {
    const url = `${IN_PROCESS_API}/mux/asset?uploadId=${encodeURIComponent(uploadId)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      console.warn(`Mux asset poll: ${response.status} ${body}`);
    } else {
      const data = (await response.json()) as any;

      if (data.playbackUrl && data.status === 'ready') {
        return {
          playbackUrl: data.playbackUrl,
          assetId: data.assetId || '',
          downloadUrl: data.downloadUrl || '',
        };
      }
    }

    await new Promise(r => setTimeout(r, delayMs));
  }

  throw new Error('Mux asset processing timeout');
};

export default pollMuxAsset;
