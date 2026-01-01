import cdp from './client';
// import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministicAccountName';
import { writeErrorToFile } from '../payments/writeErrorToFile';
// import { writeErrorToFile } from '../payments/writeErrorToFile';

export async function getOrCreateSmartWallet({
  address
}:{
  address: Address
}) {
  try {
    const evmAccount = await cdp.evm.getOrCreateAccount({
      name: deterministicAccountName(address),
    });
    writeErrorToFile(evmAccount.name || "" )
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
