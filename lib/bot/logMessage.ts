import insertMetadata from '../supabase/in_process_message_metadata/insertMetadata';
import insertMessage from '../supabase/in_process_messages/insertMessage';
import { Json } from '../supabase/types';

type MessagePart = {
  type: string;
  text?: string;
  [key: string]: Json | undefined;
};

export async function logMessage(
  parts: MessagePart[],
  role: 'user' | 'assistant',
  artistAddress?: string
) {
  const { data: metadata } = await insertMetadata({
    client: 'telegram',
    artist_address: artistAddress,
  });
  if (metadata) {
    const { data: message } = await insertMessage({
      metadata: metadata.id,
      parts,
      role,
    });

    return message?.id;
  }
  return null;
}
