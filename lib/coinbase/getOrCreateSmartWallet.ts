// import cdp from './client';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministicAccountName';
import { writeErrorToFile } from '../payments/writeErrorToFile';
import { CdpClient } from '@coinbase/cdp-sdk';
import {
  CDP_API_KEY_ID,
  CDP_API_KEY_SECRET,
  CDP_WALLET_SECRET,
} from '@/lib/consts';

export async function getOrCreateSmartWallet({
  address,
}: {
  address: Address;
}) {
  try {
    const cdp = new CdpClient({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      walletSecret: CDP_WALLET_SECRET,
    });
    // const evmAccount = await cdp.evm.getOrCreateAccount({
    //   name: deterministicAccountName(address),
    // });
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
