import { SplitV2Client } from '@0xsplits/splits-sdk';
export const getSplitsClient = ({ chainId, publicClient, }) => {
    return new SplitV2Client({
        chainId,
        publicClient,
    });
};
//# sourceMappingURL=getSplitsClient.js.map