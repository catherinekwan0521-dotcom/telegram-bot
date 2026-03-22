const TelegramBot = require('node-telegram-bot-api');

//
const token = 8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc;

const bot = new TelegramBot(token, { polling: true });

// 存用户资料（简单版）
let users = {};

// /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // 生成会员ID
    const memberId = "MY" + Math.floor(100000 + Math.random() * 900000);

    users[chatId] = {
        memberId: memberId,
        language: null
    };

    bot.sendMessage(chatId,
        `👋 Welcome, ${memberId}\n\nPlease select your language:`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🇬🇧 English", callback_data: "lang_en" }],
                    [{ text: "🇲🇾 Bahasa Melayu", callback_data: "lang_bm" }],
                    [{ text: "🇨🇳 中文", callback_data: "lang_cn" }]
                ]
            }
        }
    );
});

// 处理按钮
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    // 保存语言
    if (data.startsWith("lang_")) {
        users[chatId].language = data;

        bot.sendMessage(chatId,
            "🎁 Promotion:\nWelcome Bonus RM10 🎉",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "👉 Register Now", callback_data: "register" }]
                    ]
                }
            }
        );
    }

    // 注册按钮
    if (data === "register") {
        bot.sendMessage(chatId,
            "📱 Please share your phone number:",
            {
                reply_markup: {
                    keyboard: [
                        [{ text: "📱 Share Phone Number", request_contact: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
        );
    }
});

// 接收电话号码
bot.on('contact', (msg) => {
    const chatId = msg.chat.id;
    const phone = msg.contact.phone_number;

    users[chatId].phone = phone;

    bot.sendMessage(chatId,
        `✅ Registered Successfully!\n\nYour ID: ${users[chatId].memberId}`,
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
