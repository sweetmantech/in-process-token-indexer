import { SplitV2Client } from '@0xsplits/splits-sdk';
import type { PublicClient } from 'viem';
interface GetSplitsClientParams {
    chainId: number;
    publicClient: PublicClient;
}
export declare const getSplitsClient: ({ chainId, publicClient, }: GetSplitsClientParams) => SplitV2Client;
export {};
//# sourceMappingURL=getSplitsClient.d.ts.map