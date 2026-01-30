import { sleep } from '../sleep';
import insertMessageMoment from '../supabase/in_process_message_moment/insertMessageMoment';
import { selectMoments } from '../supabase/in_process_moments/selectMoments';

const processMessageMoment = async ({
  messageId,
  collectionAddress,
  tokenId,
}: {
  messageId: string;
  collectionAddress: string;
  tokenId: string;
}) => {
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
