import { TurboFactory } from '@ardrive/turbo-sdk';
import { ARWEAVE_KEY } from './consts';

const turboClient = TurboFactory.authenticated({ privateKey: ARWEAVE_KEY });

export const uploadToArweave = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  console.log('📤 Uploading to Arweave...', mimeType);
  console.log('📊 Buffer size:', buffer.length, 'bytes');

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
};

export default uploadToArweave;
