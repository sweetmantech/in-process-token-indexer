"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxBlockTimestamp = getMaxBlockTimestamp;
const consts_1 = require("../consts");
const selectTokens_1 = require("../supabase/in_process_tokens/selectTokens");
/**
 * Gets the maximum createdAt timestamp from the in_process_tokens table grouped by chainId.
 * @returns Array of objects with chainId and maxTimestamp properties.
 */
async function getMaxBlockTimestamp() {
    const promises = consts_1.networks.map(async (network) => {
        const tokens = (await (0, selectTokens_1.selectTokens)({
            chainId: network.id,
            limit: 1,
            orderBy: { field: 'createdAt', ascending: false },
        }));
        if (!tokens || tokens.length === 0) {
            return {
                maxTimestamp: Math.floor(new Date(0).getTime() / 1000),
                chainId: network.id,
            };
        }
        return {
            maxTimestamp: Math.floor(new Date(tokens[0].createdAt).getTime() / 1000),
            chainId: network.id,
        };
    });
    const maxTimestamps = await Promise.all(promises);
    return maxTimestamps;
}
