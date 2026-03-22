const TelegramBot = require('node-telegram-bot-api');

//
const token = '8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc';

const bot = new TelegramBot(token, { polling: true });

// 模拟数据库（之后可以换Firebase）
let users = {};

// ====== START ======
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // 创建用户（如果没有）
    if (!users[chatId]) {
        const memberId = "MY" + Math.floor(100000 + Math.random() * 900000);

        users[chatId] = {
            telegram_id: chatId,
            member_id: memberId,
            phone: null,
            name: null,
            balance: 0,
            language: null,
            step: null
        };
    }

    const user = users[chatId];

    // ====== ✅ 已注册用户 ======
    if (user.phone && user.name) {

        bot.sendMessage(chatId,
`👋 Welcome back ${user.member_id}

👤 Name: ${user.name}
📱 Phone: ${user.phone}
💰 Balance: RM${user.balance}

👇 Please choose service`,
        {
            reply_markup: {
                keyboard: [
                    ["💰 Deposit", "💸 Withdraw"],
                    ["🔁 Transfer", "🆔 Game ID"],
                    ["🎁 Promo", "🏆 Agent"],
                    ["🚀 Guide", "💬 Support"]
                ],
                resize_keyboard: true
            }
        });

        return;
    }

    // ====== ❗未注册用户 ======
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


// ====== BUTTON HANDLER ======
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    // 语言
    if (data === "en" || data === "bm" || data === "cn") {

        users[chatId].language = data;

        let msg = "";
        let btn = "";

        if (data === "en") {
            msg = "🎁 Welcome Bonus RM10\n\nClick register 👇";
            btn = "👉 Register";
        }

        if (data === "bm") {
            msg = "🎁 Bonus Selamat Datang RM10\n\nKlik daftar 👇";
            btn = "👉 Daftar";
        }

        if (data === "cn") {
            msg = "🎁 欢迎奖金 RM10\n\n点击注册 👇";
            btn = "👉 注册";
        }

        bot.sendMessage(chatId, msg, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: btn, callback_data: "register" }]
                ]
            }
        });
    }

    // 注册
    if (data === "register") {
        users[chatId].step = "name";

        bot.sendMessage(chatId, "📝 Please enter your FULL NAME:");
    }
});


// ====== MESSAGE HANDLER ======
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!users[chatId]) return;

    const user = users[chatId];

    // ====== 输入名字 ======
    if (user.step === "name") {
        user.name = text;
        user.step = "phone";

        bot.sendMessage(chatId,
            "📱 Please share your phone:",
            {
                reply_markup: {
                    keyboard: [
                        [{ text: "📱 Share Phone", request_contact: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
        );
        return;
    }

    // ====== Deposit Menu ======
    if (text === "💰 Deposit") {

        bot.sendMessage(chatId,
`ℹ️ Minimum deposit RM30

请选择充值金额：`,
        {
            reply_markup: {
                keyboard: [
                    ["30", "50", "100", "200"],
                    ["300", "500", "1000", "2000"],
                    ["其他金额"],
                    ["❌ Cancel"]
                ],
                resize_keyboard: true
            }
        });
        return;
    }

    // ====== Deposit Amount ======
    const amounts = ["30","50","100","200","300","500","1000","2000"];

    if (amounts.includes(text)) {

        bot.sendMessage(chatId,
`🏦 Bank Details:

Bank: Maybank
Name: ABC COMPANY
Account: 1234567890

💰 Amount: RM${text}

📸 Please send your receipt after transfer`);

        return;
    }

    if (text === "其他金额") {
        user.step = "custom_amount";
        bot.sendMessage(chatId, "请输入金额 RM:");
        return;
    }

    if (user.step === "custom_amount") {
        bot.sendMessage(chatId,
`🏦 Bank Details:

Bank: Maybank
Name: ABC COMPANY
Account: 1234567890

💰 Amount: RM${text}

📸 Please send your receipt after transfer`);

        user.step = null;
        return;
    }

    if (text === "❌ Cancel") {
        bot.sendMessage(chatId, "❌ Cancelled");
        return;
    }
});


// ====== CONTACT ======
bot.on("contact", (msg) => {
    const chatId = msg.chat.id;

    if (!users[chatId]) return;

    users[chatId].phone = msg.contact.phone_number;
    users[chatId].step = null;

    const user = users[chatId];

    bot.sendMessage(chatId,
`✅ Registered Successfully!

🆔 ID: ${user.member_id}
👤 Name: ${user.name}
📱 Phone: ${user.phone}
💰 Balance: RM0

👇 Please choose service`,
        {
            reply_markup: {
                keyboard: [
                    ["💰 Deposit", "💸 Withdraw"],
                    ["🔁 Transfer", "🆔 Game ID"],
                    ["🎁 Promo", "🏆 Agent"],
                    ["🚀 Guide", "💬 Support"]
                ],
                resize_keyboard: true
            }
        }
    );
});
