import TelegramBot from 'node-telegram-bot-api';
import { setBot } from './bot';

const MOVED_MESSAGE =
  'This bot has moved to @in_process_chat_bot. Please use that bot instead.';

export async function runBot(): Promise<TelegramBot> {
  const bot = await setBot();

  bot.on('message', async msg => {
    const chatId = msg.chat.id;
    try {
      await bot.sendMessage(chatId, MOVED_MESSAGE);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  console.log('✅ Telegram bot started and listening for messages...');

  return bot;
}
