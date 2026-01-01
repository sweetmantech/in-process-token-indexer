import cdp from './client';
// import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministicAccountName';
import { writeErrorToFile } from '../payments/writeErrorToFile';

const CDP_TIMEOUT_MS = 30000; // 30 seconds timeout for CDP calls

/**
 * Wraps a CDP call with a timeout to prevent hanging in cron jobs
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`⏱️ CDP operation "${operation}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function getOrCreateSmartWallet({
  address,
}: {
  address: Address;
}) {
  try {
    await writeErrorToFile(deterministicAccountName(address));
    const evmAccount = await withTimeout(
      cdp.evm.getOrCreateAccount({
        name: deterministicAccountName(address),
      }),
      CDP_TIMEOUT_MS,
      'getOrCreateAccount'
    );
    await writeErrorToFile(evmAccount?.name || '');
    // const smartAccount = await withTimeout(
    //   cdp.evm.getOrCreateSmartAccount({
    //     name: evmAccount.name as string,
    //     owner: evmAccount,
    //   }),
    //   CDP_TIMEOUT_MS,
    //   'getOrCreateSmartAccount'
    // );
    return 1;
  } catch (error) {
    const errorMessage = `❌ Failed to initialize CdpClient: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage, error);
    // Re-throw to prevent silent failures in cron jobs
    throw error;
  }
}
