"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const getChain_js_1 = require("./getChain.js");
const getPublicClient = (chainId) => (0, viem_1.createPublicClient)({
    chain: (0, getChain_js_1.getChain)(chainId),
    transport: (0, viem_1.http)(),
});
exports.default = getPublicClient;
