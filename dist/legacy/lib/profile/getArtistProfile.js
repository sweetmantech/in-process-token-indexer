"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getEnsName_1 = __importDefault(require("../viem/getEnsName"));
const getZoraProfile_1 = __importDefault(require("./getZoraProfile"));
const getArtistProfile = async (walletAddress) => {
    try {
        let profile = {
            username: '',
            bio: '',
            socials: {
                instagram: '',
                twitter: '',
                telegram: '',
            },
        };
        const zora = await (0, getZoraProfile_1.default)(walletAddress);
        if (zora) {
            profile = {
                ...profile,
                username: zora.displayName || '',
                bio: zora.description || '',
                socials: {
                    ...profile.socials,
                    twitter: zora.socialAccounts?.twitter?.username || '',
                    instagram: zora.socialAccounts?.instagram?.username || '',
                },
            };
        }
        else {
            const ensName = await (0, getEnsName_1.default)(walletAddress);
            if (ensName)
                profile = {
                    ...profile,
                    username: ensName,
                };
        }
        return profile;
    }
    catch (error) {
        console.error(error);
        return {
            username: '',
            bio: '',
        };
    }
};
exports.default = getArtistProfile;
