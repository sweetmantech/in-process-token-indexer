import cdp from './client';
// import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
// import { deterministicAccountName } from './deterministicAccountName';
// import { writeErrorToFile } from '../payments/writeErrorToFile';

export async function getOrCreateSmartWallet() {
  try {
    // Use singleton client from client.ts instead of creating new instance
    // Creating new CdpClient instances can hang in cron environments
    // The singleton is already initialized at module load time
    // await writeErrorToFile(
    //   JSON.stringify({
    //     apiKeyId: CDP_API_KEY_ID,
    //     apiKeySecret: CDP_API_KEY_SECRET,
    //     walletSecret: CDP_WALLET_SECRET,
    //   })
    // );
    // const evmAccount = await cdp.evm.getOrCreateAccount({
    //   name: deterministicAccountName(address),
    // });
    // const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    //   name: evmAccount.name as string,
    //   owner: evmAccount,
    // });
    return 1;
  } catch (error) {
    const errorMessage = `❌ Failed to initialize CdpClient: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage, error);
    // Re-throw to prevent silent failures in cron jobs
    throw error;
  }
}
