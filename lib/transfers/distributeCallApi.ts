import { Address } from 'viem';
import { IN_PROCESS_API } from '../consts';

const distributeApiCall = async ({
  splitAddress,
  tokenAddress,
  chainId,
}: {
  splitAddress: Address;
  tokenAddress: Address;
  chainId: number;
}) => {
  try {
    const response = await fetch(`${IN_PROCESS_API}/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        splitAddress,
        tokenAddress,
        chainId,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `❌ API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const data = await response.json();
    return data.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`❌ Distribution API call failed: ${String(error)}`);
  }
};

export default distributeApiCall;
