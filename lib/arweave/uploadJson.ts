import uploadToArweave from './uploadToArweave';

export async function uploadJson(json: object): Promise<string> {
  const jsonString = JSON.stringify(json);
  const buffer = Buffer.from(jsonString);
  const mimeType = 'application/json';
  const uri = await uploadToArweave(buffer, mimeType);
  return uri;
}
