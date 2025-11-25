"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const indexPayments_js_1 = __importDefault(require("./legacy/lib/payments/indexPayments.js"));
const indexMoments_js_1 = __importDefault(require("./legacy/lib/moment/indexMoments.js"));
const indexAdmins_js_1 = __importDefault(require("./legacy/lib/moment/indexAdmins.js"));
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
async function indexAllNetworks() {
    // Start all indexers: payments, moments, and admins
    const legacyPaymentsIndexer = (0, indexPayments_js_1.default)();
    const legacyMomentsIndexer = (0, indexMoments_js_1.default)();
    const legacyAdminsIndexer = (0, indexAdmins_js_1.default)();
    await Promise.all([
        legacyPaymentsIndexer,
        legacyMomentsIndexer,
        legacyAdminsIndexer,
    ]);
}
indexAllNetworks().catch(error => {
    console.error('Fatal error in indexer:', error);
    process.exit(1);
});
