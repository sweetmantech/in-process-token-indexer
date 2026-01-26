import { getBlob } from './getBlob';

const uploadFile = async (fileId: string) => {
  const { blob, mimeType } = await getBlob(fileId);
  const buffer = Buffer.from(await blob.arrayBuffer());
  return {
    buffer,
    mimeType,
  };
};

export default uploadFile;
