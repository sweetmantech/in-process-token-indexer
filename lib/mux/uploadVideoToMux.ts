import fetch from 'node-fetch';
import createUploadUrl from './createUploadUrl';
import pollMuxAsset from './pollMuxAsset';

export interface MuxUploadResult {
  playbackUrl: string;
  assetId: string;
  downloadUrl: string;
}

const uploadVideoToMux = async (
  buffer: Buffer,
  mimeType: string
): Promise<MuxUploadResult> => {
  const { uploadURL, uploadId } = await createUploadUrl();

  const uploadResponse = await fetch(uploadURL, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: buffer,
  });
  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload video to Mux: ${uploadResponse.statusText}`
    );
  }

  return pollMuxAsset(uploadId);
};

export default uploadVideoToMux;
