interface ZoraProfile {
    displayName?: string;
    description?: string;
    socialAccounts?: {
        twitter?: {
            username?: string;
        };
        instagram?: {
            username?: string;
        };
    };
}
declare function getZoraProfile(address: string): Promise<ZoraProfile | null>;
export default getZoraProfile;
//# sourceMappingURL=getZoraProfile.d.ts.map