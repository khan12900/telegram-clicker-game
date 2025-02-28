const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Create a bot instance
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Game URL - will be updated after deployment
const gameUrl = 'https://telegram-clicker-game.vercel.app';

// Handle /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        await bot.sendMessage(chatId, 'Welcome to the Clicker Game! 🎮\n\nClick Play Game to start playing!', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🎮 Play Game',
                        web_app: { url: gameUrl }
                    }
                ]]
            }
        });
    } catch (error) {
        console.error('Error sending welcome message:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error starting the game. Please try again.');
    }
});

// Handle callback queries
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    bot.answerCallbackQuery(query.id);
});

console.log('Bot is running on URL:', gameUrl);
