import { InProcess_Payments_t } from '@/types/envio';
import isSplitContract from '@/lib/splits/isSplitContract';
import { Address } from 'viem';
import distributeApiCall from './distributeCallApi';

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
        const hash = await distributeApiCall({
          splitAddress: deposit.recipient as Address,
          tokenAddress: deposit.currency as Address,
          chainId: deposit.chain_id,
        });
        // Transaction sent successfully - distribution completed for this deposit
        console.log(
          `✅ Distribution completed: ${deposit.amount} ${deposit.currency} to ${recipient} (tx: ${hash})`
        );
        totalCnt++;
      } catch (error) {
        console.error(
          `❌ Failed to distribute ${deposit.amount} ${deposit.currency} to ${recipient}:`,
          error
        );
      }
    }
  }
  if (totalCnt > 0) {
    console.log(`✅ Successfully distributed ${totalCnt} payment(s)`);
  }
}
