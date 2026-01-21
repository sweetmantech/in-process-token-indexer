import Arweave from 'arweave';
import { ARWEAVE_KEY } from './consts';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
});

const uploadToArweave = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();

  const transaction = await arweave.createTransaction(
    {
      data: buffer,
    },
    ARWEAVE_KEY
  );
  transaction.addTag('Content-Type', file.type);
  await arweave.transactions.sign(transaction, ARWEAVE_KEY);
  const uploader = await arweave.transactions.getUploader(transaction);

  while (!uploader.isComplete) {
    console.log(
      `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
    );
    await uploader.uploadChunk();
  }

  return `ar://${transaction.id}`;
};

export default uploadToArweave;
