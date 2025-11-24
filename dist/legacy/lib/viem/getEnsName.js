"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chains_1 = require("viem/chains");
const viem_1 = require("viem");
const getEnsName = async (address) => {
    try {
        const publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.mainnet,
            transport: (0, viem_1.http)(),
        });
        const ensName = await publicClient.getEnsName({
            address,
        });
        return ensName || '';
    }
    catch (error) {
        console.error(error);
        return '';
    }
};
exports.default = getEnsName;
