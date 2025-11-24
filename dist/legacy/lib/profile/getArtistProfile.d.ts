interface ArtistProfile {
    username: string;
    bio: string;
    socials?: {
        instagram: string;
        twitter: string;
        telegram: string;
    };
}
declare const getArtistProfile: (walletAddress: `0x${string}`) => Promise<ArtistProfile>;
export default getArtistProfile;
//# sourceMappingURL=getArtistProfile.d.ts.map