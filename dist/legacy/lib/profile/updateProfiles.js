"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateProfiles;
const ensureArtists_1 = require("../artists/ensureArtists");
/**
 * Updates artist profiles in the in_process_artists table based on decoded logs.
 * @param decodedLogs - Array of decoded log objects.
 */
async function updateProfiles(decodedLogs) {
    const artistAddresses = decodedLogs.map(log => log.args.defaultAdmin.toLowerCase());
    await (0, ensureArtists_1.ensureArtists)(artistAddresses);
}
