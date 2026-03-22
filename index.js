const TelegramBot = require('node-telegram-bot-api');

//
const token = '8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc';

const bot = new TelegramBot(token, { polling: true });

// 模拟数据库
let users = {};

// /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // 如果用户不存在 → 创建
    if (!users[chatId]) {
        const memberId = "MY" + Math.floor(100000 + Math.random() * 900000);

        users[chatId] = {
            telegram_id: chatId,
            member_id: memberId,
            phone: null,
            balance: 0
        };
    }

    const user = users[chatId];

    bot.sendMessage(chatId,
`👋 👋 👋 👋 👋 👋 👋 👋 👋  

Welcome ${user.member_id}
Salam ${user.member_id}
欢迎 ${user.member_id}

Please select language:`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🇬🇧 English", callback_data: "en" }],
                    [{ text: "🇲🇾 BM", callback_data: "bm" }],
                    [{ text: "🇨🇳 中文", callback_data: "cn" }]
                ]
            }
        }
    );
});
