"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const indexPayments_1 = __importDefault(require("./legacy/lib/payments/indexPayments"));
const indexMoments_1 = __importDefault(require("./legacy/lib/moment/indexMoments"));
const indexAdmins_1 = __importDefault(require("./legacy/lib/moment/indexAdmins"));
const executeCollectionsIndexingParallel_1 = require("./lib/collections/executeCollectionsIndexingParallel");
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
    await (0, executeCollectionsIndexingParallel_1.executeCollectionsIndexingParallel)();
}
legacyIndex().catch(error => {
    console.error('Fatal error in indexer:', error);
    process.exit(1);
});
index().catch(error => {
    console.error('Fatal error in indexer:', error);
    process.exit(1);
});
