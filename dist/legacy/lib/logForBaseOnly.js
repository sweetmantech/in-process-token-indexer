"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logForBaseOnly = void 0;
// Helper function to log only for base network (not baseSepolia)
const logForBaseOnly = (network, ...args) => {
    if (network === 'base') {
        console.log(...args);
    }
};
exports.logForBaseOnly = logForBaseOnly;
