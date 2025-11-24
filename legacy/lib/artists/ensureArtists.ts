import getArtistProfile from '../profile/getArtistProfile';
import { upsertArtists } from '../supabase/in_process_artists/upsertArtists';
import { selectArtists } from '../supabase/in_process_artists/selectArtists';

/**
 * Ensures that all provided artist addresses exist in the in_process_artists table.
 * Creates new artist records with profiles if they don't exist.
 * @param addresses - Array of artist addresses to ensure exist
 */
export async function ensureArtists(addresses: string[]): Promise<void> {
  if (!addresses || addresses.length === 0) {
    return;
  }

  // Get unique addresses and normalize to lowercase
  const uniqueAddresses = [
    ...new Set(addresses.map(addr => addr.toLowerCase())),
  ];

  // Check which addresses already exist in the database
  const existingArtists = await selectArtists(uniqueAddresses, 'address');

  const existingAddresses = new Set(
    (existingArtists as Array<{ address: string }>).map(artist =>
      artist.address.toLowerCase()
    )
  );

  // Find addresses that need to be created
  const addressesToCreate = uniqueAddresses.filter(
    address => !existingAddresses.has(address.toLowerCase())
  );

  if (addressesToCreate.length === 0) {
    console.log('All artists already exist in database');
    return;
  }

  console.log(`Creating ${addressesToCreate.length} new artists...`);

  // Create artist profiles for new addresses
  const newArtists = await Promise.all(
    addressesToCreate.map(async address => {
      try {
        const profile = await getArtistProfile(address as `0x${string}`);
        return {
          address: address.toLowerCase(),
          username: profile.username || '',
          bio: profile.bio || '',
          instagram_username: profile.socials?.instagram || '',
          twitter_username: profile.socials?.twitter || '',
          telegram_username: profile.socials?.telegram || '',
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(`Failed to get profile for ${address}:`, errorMessage);
        // Create minimal artist record if profile fetch fails
        return {
          address: address.toLowerCase(),
          username: '',
          bio: '',
          instagram_username: '',
          twitter_username: '',
          telegram_username: '',
        };
      }
    })
  );

  // Upsert the new artists
  await upsertArtists(newArtists);
  console.log(`Successfully created ${newArtists.length} new artists`);
}
