import { ensureArtists } from '../artists/ensureArtists.js';

interface DecodedLog {
  args: {
    defaultAdmin: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Updates artist profiles in the in_process_artists table based on decoded logs.
 * @param decodedLogs - Array of decoded log objects.
 */
export default async function updateProfiles(
  decodedLogs: DecodedLog[]
): Promise<void> {
  const artistAddresses = decodedLogs.map(log =>
    log.args.defaultAdmin.toLowerCase()
  );
  await ensureArtists(artistAddresses);
}
