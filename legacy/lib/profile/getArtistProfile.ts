import getEnsName from '../viem/getEnsName';
import getZoraProfile from './getZoraProfile';

interface ArtistProfile {
  username: string;
  bio: string;
  socials?: {
    instagram: string;
    twitter: string;
    telegram: string;
  };
}

const getArtistProfile = async (
  walletAddress: `0x${string}`
): Promise<ArtistProfile> => {
  try {
    let profile: ArtistProfile = {
      username: '',
      bio: '',
      socials: {
        instagram: '',
        twitter: '',
        telegram: '',
      },
    };

    const zora = await getZoraProfile(walletAddress);
    if (zora) {
      profile = {
        ...profile,
        username: zora.displayName || '',
        bio: zora.description || '',
        socials: {
          ...profile.socials!,
          twitter: zora.socialAccounts?.twitter?.username || '',
          instagram: zora.socialAccounts?.instagram?.username || '',
        },
      };
    } else {
      const ensName = await getEnsName(walletAddress);
      if (ensName)
        profile = {
          ...profile,
          username: ensName,
        };
    }

    return profile;
  } catch (error) {
    console.error(error);
    return {
      username: '',
      bio: '',
    };
  }
};

export default getArtistProfile;
