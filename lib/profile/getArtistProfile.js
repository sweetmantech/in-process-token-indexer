import getEnsName from "../viem/getEnsName.js";
import getZoraProfile from "./getZoraProfile.js";

const getArtistProfile = async (walletAddress) => {
  try {
    let profile = {
      username: "",
      bio: "",
      socials: {
        instagram: "",
        twitter: "",
        telegram: "",
      },
    };

    const zora = await getZoraProfile(walletAddress);
    if (zora) {
      profile = {
        ...profile,
        username: zora.displayName,
        bio: zora.description,
        socials: {
          ...profile.socials,
          twitter: zora.socialAccounts.twitter?.username || "",
          instagram: zora.socialAccounts.instagram?.username || "",
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
      username: "",
      bio: "",
    };
  }
};

export default getArtistProfile;
