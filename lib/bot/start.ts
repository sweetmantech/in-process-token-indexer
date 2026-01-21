import TelegramBot from 'node-telegram-bot-api';
import { setBot } from './bot';
import { sendConnectTelegramMsg } from './sendConnectTelegramMsg';

export function runBot(): TelegramBot {
  const bot = setBot();

  bot.on('message', async msg => {
    const chatId = msg.chat.id;
    console.log(`📨 Received message from chat ${chatId}`);
    const sender = msg.chat.username;
    if (!sender) return;

    const isSent = await sendConnectTelegramMsg(chatId, sender);
    if (isSent) {
      return;
    }
  });

  console.log('✅ Telegram bot started and listening for messages...');

  return bot;
}
