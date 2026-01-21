import { Address, maxUint64, parseUnits } from 'viem';
import { REFERRAL_RECIPIENT, USDC_ADDRESS } from './consts';

const getCreateParameter = async (
  artistAddress: Address,
  name: string,
  uri: string
) => {
  const parameters = {
    contract: {
      name,
      uri,
    },
    token: {
      tokenMetadataURI: uri,
      createReferral: REFERRAL_RECIPIENT as Address,
      salesConfig: {
        type: 'erc20Mint',
        pricePerToken: parseUnits('1', 6).toString(),
        saleStart: Number(new Date().getTime() / 1000).toFixed(0),
        saleEnd: maxUint64.toString(),
        currency: USDC_ADDRESS as Address,
      },
      mintToCreatorCount: 1,
      payoutRecipient: artistAddress,
    },
    account: artistAddress,
  };

  return parameters;
};

export default getCreateParameter;
