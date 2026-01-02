import { Address } from 'viem';

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
    const response = await fetch(`https://inprocess.world/api/distribute`, {
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
