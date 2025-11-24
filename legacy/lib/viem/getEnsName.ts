import { mainnet } from 'viem/chains';
import { createPublicClient, http } from 'viem';

const getEnsName = async (address: `0x${string}`): Promise<string> => {
  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });
    const ensName = await publicClient.getEnsName({
      address,
    });

    return ensName || '';
  } catch (error) {
    console.error(error);
    return '';
  }
};

export default getEnsName;
