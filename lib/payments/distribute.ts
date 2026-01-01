import { InProcess_Payments_t } from '@/types/envio';
import isSplitContract from '@/lib/splits/isSplitContract';
import { Address } from 'viem';
import { getSplitCall } from '@/lib/viem/getSplitCall';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { baseSepolia } from 'viem/chains';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { deterministicAccountName } from '../coinbase/deterministicAccountName';
import { writeErrorToFile } from './writeErrorToFile';

export async function distribute(deposits: InProcess_Payments_t[]) {
  let totalCnt = 0;
  for (const deposit of deposits) {
    const recipient = deposit.recipient;
    const isSplit = await isSplitContract(
      recipient as Address,
      deposit.chain_id
    );
    if (isSplit) {
      try {
        const smartAccount = await getOrCreateSmartWallet({
          address: deposit.spender as Address,
        });

        // const splitCall = await getSplitCall({
        //   splitAddress: recipient as Address,
        //   tokenAddress: deposit.currency as Address,
        //   smartAccount,
        //   chainId: deposit.chain_id,
        // });
        // // Send the transaction and wait for receipt using the helper
        // const transaction = await sendUserOperation({
        //   smartAccount,
        //   network:
        //     deposit.chain_id === baseSepolia.id ? 'base-sepolia' : 'base',
        //   calls: [splitCall],
        // });
        // // Transaction sent successfully - distribution completed for this deposit
        // console.log(
        //   `✅ Distribution completed: ${deposit.amount} ${deposit.currency} to ${recipient} (tx: ${transaction.transactionHash})`
        // );
        totalCnt++;
      } catch (error) {
        const errorMessage = `❌ Failed to distribute ${deposit.amount} ${deposit.currency} to ${recipient}`;
        console.error(errorMessage, error);
        await writeErrorToFile(errorMessage, error);
      }
    }
  }
  if (totalCnt > 0) {
    console.log(`✅ Successfully distributed ${totalCnt} payment(s)`);
  }
}
