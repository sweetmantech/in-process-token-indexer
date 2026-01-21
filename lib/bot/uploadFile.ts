import { getBlob } from './getBlob';

const uploadFile = async (fileId: string) => {
  const { blob, mimeType } = await getBlob(fileId);
  const buffer = Buffer.from(await blob.arrayBuffer());
  const file = new File([buffer], 'file', { type: mimeType });
  return {
    file,
    mimeType,
  };
};

export default uploadFile;
