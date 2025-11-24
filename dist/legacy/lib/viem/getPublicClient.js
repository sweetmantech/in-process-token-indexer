import { createPublicClient, http } from 'viem';
import { getChain } from './getChain.js';
const getPublicClient = (chainId) => createPublicClient({
    chain: getChain(chainId),
    transport: http(),
});
export default getPublicClient;
//# sourceMappingURL=getPublicClient.js.map