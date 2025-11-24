"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSplitsClient = void 0;
const splits_sdk_1 = require("@0xsplits/splits-sdk");
const getSplitsClient = ({ chainId, publicClient, }) => {
    return new splits_sdk_1.SplitV2Client({
        chainId,
        publicClient,
    });
};
exports.getSplitsClient = getSplitsClient;
