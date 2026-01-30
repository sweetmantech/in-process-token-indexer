import { sleep } from '../sleep';
import insertMessageMoment from '../supabase/in_process_message_moment/insertMessageMoment';
import { selectMoments } from '../supabase/in_process_moments/selectMoments';
import { logMessage } from './logMessage';

const processMessageMoment = async ({
  collectionAddress,
  tokenId,
  artistAddress,
}: {
  collectionAddress: string;
  tokenId: string;
  artistAddress: string;
}) => {
  const messageId = await logMessage(
    [
      {
        type: 'text',
        text: `✅ Moment created! https://inprocess.world/sms/base:${collectionAddress}/${tokenId}`,
      },
    ],
    'assistant',
    artistAddress
  );

  if (!messageId) return;

  while (true) {
    const moments = await selectMoments({
      collectionAddresses: [collectionAddress],
      tokenIds: [Number(tokenId)],
    });
    const moment = moments?.[0];
    if (moment) {
      await insertMessageMoment({
        message: messageId,
        moment: moment.id,
      });
      break;
    }
    await sleep(3000);
  }
};

export default processMessageMoment;
