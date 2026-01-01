import cdp from './client';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministicAccountName';

export async function getOrCreateSmartWallet({
  address,
}: {
  address: Address;
}): Promise<EvmSmartAccount> {
  console.log('ziad here', deterministicAccountName(address))
  const evmAccount = await cdp.evm.getOrCreateAccount({
    name: deterministicAccountName(address),
  });
  const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: evmAccount.name as string,
    owner: evmAccount,
  });
  return smartAccount;
}
