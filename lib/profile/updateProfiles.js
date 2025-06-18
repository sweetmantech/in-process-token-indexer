import getArtistProfile from "./getArtistProfile.js";
import { upsertArtists } from "../supabase/in_process_artists/upsertArtists.js";

/**
 * Updates artist profiles in the in_process_artists table based on decoded logs.
 * @param {Array<Object>} decodedLogs - Array of decoded log objects.
 */
export default async function updateProfiles(decodedLogs) {
  const artistAddresses = decodedLogs.map((log) =>
    log.args.defaultAdmin.toLowerCase()
  );
  const uniqueArtistAddresses = [...new Set(artistAddresses)];
  const artistProfiles = await Promise.all(
    uniqueArtistAddresses.map(async (address) => {
      const profile = await getArtistProfile(address);
      return {
        address,
        username: profile.username || "",
        bio: profile.bio || "",
        instagram_username: profile.socials?.instagram || "",
        twitter_username: profile.socials?.twitter || "",
        telegram_username: profile.socials?.telegram || "",
      };
    })
  );
  await upsertArtists(artistProfiles);
}
