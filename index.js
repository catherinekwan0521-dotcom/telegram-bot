const TelegramBot = require('node-telegram-bot-api');

//
const token = '8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc';

const bot = new TelegramBot(token, { polling: true });

// 存用户
let users = {};

// /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // 如果用户不存在才创建
    if (!users[chatId]) {
        const memberId = "MY" + Math.floor(100000 + Math.random() * 900000);

        users[chatId] = {
            memberId: memberId
        };
    }

    const memberId = users[chatId].memberId;

    bot.sendMessage(chatId,
`👋 👋 👋 👋 👋 👋 👋 👋 👋  

Welcome ${memberId}
Salam ${memberId}
欢迎 ${memberId}

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

// 按钮处理
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "en" || query.data === "bm" || query.data === "cn") {
        bot.sendMessage(chatId, "🎁 Welcome Bonus RM10\n\nClick register 👇", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "👉 Register", callback_data: "register" }]
                ]
            }
        });
    }

    if (query.data === "register") {
        bot.sendMessage(chatId, "📱 Please share your phone:", {
            reply_markup: {
                keyboard: [
                    [{ text: "📱 Share Phone", request_contact: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
});

// 收电话
bot.on("contact", (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId,
        `✅ Registered!\nYour ID: ${users[chatId].memberId}`,
        {
            reply_markup: {
                keyboard: [
                    ["💰 Deposit", "💸 Withdraw"],
                    ["🎁 Promo", "💬 Support"]
                ],
                resize_keyboard: true
            }
        }
    );
});
