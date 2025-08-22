const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('BOT_TOKEN is required in .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Web App URL (in production, this should be your hosted frontend URL)
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  console.log(`User ${userId} started the bot`);
  
  const welcomeMessage = `🎮 Welcome to Quest Rewards!\n\nEarn points by completing simple tasks and quests.\n\n🔧 For local testing, open this URL in your browser:\n${webAppUrl}\n\n(Telegram doesn't allow localhost URLs in buttons, so copy the link above)`;
  
  bot.sendMessage(chatId, welcomeMessage);
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `ℹ️ Help\n\nAvailable commands:\n/start - Start the bot and open Mini App\n/help - Show this help message\n\n🎯 How to use:\n1. Click "Open Mini App" button\n2. Complete quests to earn points\n3. Claim your rewards!`;
  
  bot.sendMessage(chatId, helpMessage);
});

// Handle any text message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  
  // Skip if it's a command (starts with /)
  if (messageText && messageText.startsWith('/')) {
    return;
  }
  
  // For any other message, suggest using the Mini App
  if (messageText) {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Open Quest App',
              web_app: { url: webAppUrl }
            }
          ]
        ]
      }
    };
    
    bot.sendMessage(chatId, '👋 Use the Quest App to complete tasks and earn rewards!', options);
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Telegram bot is running...');
console.log(`Web App URL: ${webAppUrl}`);