"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxBlockTimestamp = getMaxBlockTimestamp;
const consts_1 = require("../consts");
const selectAdmins_1 = require("../supabase/in_process_token_admins/selectAdmins");
/**
 * Gets the maximum createdAt timestamp from the in_process_token_admins table grouped by chainId.
 * @returns Array of objects with chainId and maxTimestamp properties.
 */
async function getMaxBlockTimestamp() {
    const promises = consts_1.networks.map(async (network) => {
        const admins = (await (0, selectAdmins_1.selectAdmins)(network.id));
        if (!admins || admins.length === 0) {
            return {
                maxTimestamp: Math.floor(new Date(0).getTime() / 1000),
                chainId: network.id,
            };
        }
        return {
            maxTimestamp: Math.floor(new Date(admins[0].createdAt).getTime() / 1000),
            chainId: network.id,
        };
    });
    const maxTimestamps = await Promise.all(promises);
    return maxTimestamps;
}
