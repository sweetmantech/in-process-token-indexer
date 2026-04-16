import { executeIndexers } from '@/lib/indexers/executeIndexers';

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

async function index(): Promise<void> {
  executeIndexers();
}

index().catch(error => {
  console.error('❌ Fatal error in indexer:', error);
  process.exit(1);
});
