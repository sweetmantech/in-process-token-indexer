import { TurboFactory } from '@ardrive/turbo-sdk';
import { ARWEAVE_KEY } from '../consts';

const turboClient = TurboFactory.authenticated({ privateKey: ARWEAVE_KEY });

export default turboClient;
