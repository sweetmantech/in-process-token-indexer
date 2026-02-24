import fetch from 'node-fetch';
import { IN_PROCESS_API } from '../consts';
import { MuxUploadResult } from './uploadVideoToMux';

const pollMuxAsset = async (uploadId: string): Promise<MuxUploadResult> => {
  const maxRetries = 60;
  const delayMs = 3000;

  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(
      `${IN_PROCESS_API}/mux/asset?uploadId=${uploadId}`
    );
    const data = (await response.json()) as any;

    if (data.playbackUrl && data.status === 'ready') {
      return {
        playbackUrl: data.playbackUrl,
        assetId: data.assetId || '',
        downloadUrl: data.downloadUrl || '',
      };
    }

    await new Promise(r => setTimeout(r, delayMs));
  }

  throw new Error('Mux asset processing timeout');
};

export default pollMuxAsset;
