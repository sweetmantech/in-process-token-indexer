import { logMessage } from './logMessage';
import { tasks } from '@trigger.dev/sdk';

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

  await tasks.trigger('process-message-moment', {
    messageId,
  });
};

export default processMessageMoment;
