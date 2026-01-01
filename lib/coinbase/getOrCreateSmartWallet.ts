import cdp from './client';
// import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministicAccountName';
import { writeErrorToFile } from '../payments/writeErrorToFile';

export async function getOrCreateSmartWallet({
  address,
}: {
  address: Address;
}) {
  const accountName = deterministicAccountName(address);
  
  try {
    // Log input parameters
    await writeErrorToFile(
      `🔍 Starting getOrCreateSmartWallet - address: ${address}, accountName: ${accountName}`
    );

    // const evmAccount = await cdp.evm.getOrCreateAccount({
    //   name: accountName,
    // });

    // Log success
    // await writeErrorToFile(
    //   `✅ Successfully got/created EVM account - name: ${evmAccount?.name || 'N/A'}, address: ${address}`
    // );

    // const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    //   name: evmAccount.name as string,
    //   owner: evmAccount,
    // });
    return 1;
  } catch (error) {
    // Detailed error logging
    const errorDetails = {
      address,
      accountName,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name || typeof error,
      errorString: String(error),
    };

    const errorMessage = `❌ Failed to getOrCreateSmartWallet for address ${address}`;
    console.error(errorMessage, error);
    
    // Write detailed error to file
    await writeErrorToFile(
      `${errorMessage}\nDetails: ${JSON.stringify(errorDetails, null, 2)}`,
      error
    );

    // Re-throw to prevent silent failures in cron jobs
    throw error;
  }
}
