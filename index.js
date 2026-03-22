const TelegramBot = require('node-telegram-bot-api');

// 我的token
const token = '8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc';

const bot = new TelegramBot(token, { polling: true });

let users = {};

// /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (!users[chatId]) {
        const memberId = "MY" + Math.floor(100000 + Math.random() * 900000);

        users[chatId] = {
            telegram_id: chatId,
            member_id: memberId,
            phone: null,
            balance: 0,
            language: null
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

// 处理按钮
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    // 语言选择
    if (data === "en" || data === "bm" || data === "cn") {

        users[chatId].language = data;

        let message = "";
        let buttonText = "";

        if (data === "en") {
            message = "🎁 Welcome Bonus RM10\n\nClick register 👇";
            buttonText = "👉 Register";
        }

        if (data === "bm") {
            message = "🎁 Bonus Selamat Datang RM10\n\nKlik daftar 👇";
            buttonText = "👉 Daftar";
        }

        if (data === "cn") {
            message = "🎁 欢迎奖金 RM10\n\n点击注册 👇";
            buttonText = "👉 注册";
        }

        bot.sendMessage(chatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: buttonText, callback_data: "register" }]
                ]
            }
        });
    }

    // register按钮（先留空）
    if (data === "register") {
        bot.sendMessage(chatId, "📱 Please share your phone:");
    }
});
