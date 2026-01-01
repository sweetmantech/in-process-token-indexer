import cdp from './client';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministicAccountName';
import { writeErrorToFile } from '../payments/writeErrorToFile';

export async function getOrCreateSmartWallet({
  address,
}: {
  address: Address;
}) {
  try {
    const evmAccount = await cdp.evm.getOrCreateAccount({
      name: deterministicAccountName(address),
    });
    // const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    //   name: evmAccount.name as string,
    //   owner: evmAccount,
    // });
    return 1;
  } catch (error) {
    const errorMessage = `❌ Failed to get or create smart wallet for address ${address}`;
    console.error(errorMessage, error);
    await writeErrorToFile(errorMessage, error);
    throw error;
  }
}
