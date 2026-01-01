import { CdpClient } from '@coinbase/cdp-sdk';
import {
  CDP_API_KEY_ID,
  CDP_API_KEY_SECRET,
  CDP_WALLET_SECRET,
} from '@/lib/consts';

const cdp = new CdpClient({
  apiKeyId: CDP_API_KEY_ID,
  apiKeySecret: CDP_API_KEY_SECRET,
  walletSecret: CDP_WALLET_SECRET,
});

export default cdp;
