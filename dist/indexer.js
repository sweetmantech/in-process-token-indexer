"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const indexPayments_1 = __importDefault(require("./legacy/lib/payments/indexPayments"));
const indexMoments_1 = __importDefault(require("./legacy/lib/moment/indexMoments"));
const indexAdmins_1 = __importDefault(require("./legacy/lib/moment/indexAdmins"));
const client_1 = require("./lib/supabase/client");
const getArtistProfile_1 = __importDefault(require("./legacy/lib/profile/getArtistProfile"));
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
async function legacyIndex() {
    // Start all indexers: payments, moments, and admins
    const legacyPaymentsIndexer = (0, indexPayments_1.default)();
    const legacyMomentsIndexer = (0, indexMoments_1.default)();
    const legacyAdminsIndexer = (0, indexAdmins_1.default)();
    await Promise.all([
        legacyPaymentsIndexer,
        legacyMomentsIndexer,
        legacyAdminsIndexer,
    ]);
}
async function index() {
    // await executeCollectionsIndexing();
    let offset = 0;
    while (true) {
        const { data, error } = await client_1.supabase
            .from('in_process_artists')
            .select('*')
            .range(offset, offset + 1000);
        const artistAddresses = data?.map((artist) => artist.address);
        const promise = artistAddresses?.map(async (address) => {
            const profile = await (0, getArtistProfile_1.default)(address);
            return {
                address: address.toLowerCase(),
                username: profile.username || '',
                bio: profile.bio || '',
                instagram_username: profile.socials?.instagram || '',
                twitter_username: profile.socials?.twitter || '',
                telegram_username: profile.socials?.telegram || '',
            };
        });
        if (promise) {
            await Promise.all(promise);
        }
        offset += 1000;
        if (error) {
            console.error('Error fetching artists:', error);
            return;
        }
        console.log('Artists:', data);
    }
}
// legacyIndex().catch(error => {
//   console.error('Fatal error in indexer:', error);
//   process.exit(1);
// });
index().catch(error => {
    console.error('Fatal error in indexer:', error);
    process.exit(1);
});
