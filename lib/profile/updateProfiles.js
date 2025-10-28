import { ensureArtists } from '../artists/ensureArtists.js';

/**
 * Updates artist profiles in the in_process_artists table based on decoded logs.
 * @param {Array<Object>} decodedLogs - Array of decoded log objects.
 */
export default async function updateProfiles(decodedLogs) {
  const artistAddresses = decodedLogs.map(log =>
    log.args.defaultAdmin.toLowerCase()
  );
  await ensureArtists(artistAddresses);
}
