import TelegramBot from 'node-telegram-bot-api';
import uploadMetadata from './uploadMetadata';
import { Address, parseUnits, maxUint64 } from 'viem';
import { REFERRAL_RECIPIENT, USDC_ADDRESS } from '../consts';
import { createMomentApi } from '../api/createMomentApi';

const processPhoto = async (
  artistAddress: Address,
  photos: TelegramBot.PhotoSize[],
  text: string
) => {
  if (!photos) return;

  const { uri, name } = await uploadMetadata(photos[photos.length - 1], text);
  const momentCreateParameters = {
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
  const result = await createMomentApi(momentCreateParameters);
  console.log('result', result);
};

export default processPhoto;
