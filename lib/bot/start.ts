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

    try {
      const isSent = await sendConnectTelegramMsg(chatId, sender);
      if (isSent) {
        return;
      }
    } catch (error) {
      console.error(
        `❌ Error handling message from chatId ${chatId}, sender ${sender}:`,
        error
      );
      // Optionally notify the sender about the error
      try {
        await bot.sendMessage(
          chatId,
          'Sorry, an error occurred while processing your message. Please try again later.'
        );
      } catch (sendError) {
        console.error(
          `❌ Failed to send error notification to chatId ${chatId}:`,
          sendError
        );
      }
    }
  });

  console.log('✅ Telegram bot started and listening for messages...');

  return bot;
}
