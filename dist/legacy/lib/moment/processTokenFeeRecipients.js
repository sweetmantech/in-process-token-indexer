"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTokenFeeRecipients = processTokenFeeRecipients;
const logForBaseOnly_1 = require("../logForBaseOnly");
const ensureArtists_1 = require("../artists/ensureArtists");
const getSplitRecipients_1 = require("../splits/getSplitRecipients");
const isSplitContract_1 = __importDefault(require("../splits/isSplitContract"));
const upsertTokenFeeRecipients_1 = require("../supabase/in_process_token_fee_recipients/upsertTokenFeeRecipients");
/**
 * Processes token fee recipients for tokens with payout recipients (split or non-split).
 * @param network - The network name (for logging purposes)
 * @param upsertedTokens - Tokens returned from upsertTokens, including payoutRecipient and chainId.
 */
async function processTokenFeeRecipients(network, upsertedTokens) {
    const recipientsInserts = [];
    const recipientAddresses = [];
    const tokensWithSplitRecipients = upsertedTokens.filter(token => token.payoutRecipient);
    for (const token of tokensWithSplitRecipients) {
        try {
            const isSplit = await (0, isSplitContract_1.default)(token.payoutRecipient, token.chainId);
            if (isSplit) {
                const recipients = await (0, getSplitRecipients_1.getSplitRecipients)(token.payoutRecipient, token.chainId);
                if (recipients && recipients.length > 0) {
                    for (const recipient of recipients) {
                        const address = recipient.address.toLowerCase();
                        recipientsInserts.push({
                            token: token.id,
                            artist_address: address,
                            percentAllocation: parseFloat(recipient.percentAllocation),
                        });
                        recipientAddresses.push(address);
                    }
                }
            }
            else {
                if (!token.payoutRecipient)
                    continue;
                const address = token.payoutRecipient.toLowerCase();
                recipientsInserts.push({
                    token: token.id,
                    artist_address: address,
                    percentAllocation: 100,
                });
                recipientAddresses.push(address);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Error processing token fee recipients for token ${token.id}: ${errorMessage}`);
            continue;
        }
    }
    // Ensure all recipients are artists
    if (recipientAddresses.length > 0) {
        await (0, ensureArtists_1.ensureArtists)(recipientAddresses);
    }
    // Bulk upsert into in_process_token_fee_recipients
    if (recipientsInserts.length > 0) {
        await (0, upsertTokenFeeRecipients_1.upsertTokenFeeRecipients)(recipientsInserts);
    }
}
