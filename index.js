const TelegramBot = require('node-telegram-bot-api');

//
const token = '8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc';

const bot = new TelegramBot(token, { polling: true });

// 模拟数据库
let users = {};


// ====== /start ======
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (!users[chatId]) {
        const memberId = "MY" + Math.floor(100000 + Math.random() * 900000);

        users[chatId] = {
            telegram_id: chatId,
            member_id: memberId,
            phone: null,
            name: null,
            temp_name: null,
            balance: 0,
            language: null,
            step: null
        };
    }

    const user = users[chatId];

    // ✅ 已注册
    if (user.phone && user.name) {
        bot.sendMessage(chatId,
`👋 Welcome back ${user.member_id}

👤 ${user.name}
💰 Balance: RM${user.balance}`,
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

    // ❗未注册
    bot.sendMessage(chatId,
`👋 Welcome ${user.member_id}

Please select language:`,
    {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🇬🇧 English", callback_data: "en" }],
                [{ text: "🇲🇾 BM", callback_data: "bm" }],
                [{ text: "🇨🇳 中文", callback_data: "cn" }]
            ]
        }
    });
});


// ====== 按钮 ======
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const user = users[chatId];

    // 语言
    if (data === "en" || data === "bm" || data === "cn") {
        user.language = data;

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
        user.step = "name";

        if (user.language === "en") {
            bot.sendMessage(chatId,
`📝 Please enter your FULL NAME (Bank Account Name)

⚠️ IMPORTANT:
Name must match your bank account name
Otherwise deposit/withdrawal may fail

❌ Wrong name = No responsibility`);
        }

        if (user.language === "bm") {
            bot.sendMessage(chatId,
`📝 Sila masukkan NAMA PENUH (Nama Akaun Bank)

⚠️ PENTING:
Nama mesti sama dengan akaun bank
Jika tidak, deposit/pengeluaran mungkin gagal

❌ Nama salah = Tiada tanggungjawab`);
        }

        if (user.language === "cn") {
            bot.sendMessage(chatId,
`📝 请输入您的银行户口姓名

⚠️ 重要：
姓名必须与银行户口一致
否则存款/提款可能失败

❌ 名字错误 = 本平台不负责`);
        }
    }
});


// ====== MESSAGE ======
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") return;
    if (!users[chatId]) return;

    const user = users[chatId];

    // ====== 输入名字 ======
    if (user.step === "name") {
        user.temp_name = text;
        user.step = "confirm_name";

        bot.sendMessage(chatId,
`👤 ${text}

Confirm name?`,
        {
            reply_markup: {
                keyboard: [["✅ Yes", "❌ No"]],
                resize_keyboard: true
            }
        });
        return;
    }

    // ====== 确认名字 ======
    if (user.step === "confirm_name") {

        if (text === "✅ Yes") {
            user.name = user.temp_name;
            user.step = "phone";

            bot.sendMessage(chatId,
                "📱 Please share your phone:",
                {
                    reply_markup: {
                        keyboard: [
                            [{ text: "📱 Share Phone", request_contact: true }]
                        ],
                        resize_keyboard: true
                    }
                }
            );
        }

        if (text === "❌ No") {
            user.step = "name";
            bot.sendMessage(chatId, "❗ Please re-enter your FULL NAME:");
        }

        return;
    }

    // ====== Deposit ======
    if (text === "💰 Deposit") {

        bot.sendMessage(chatId,
"Minimum RM30\nSelect amount:",
        {
            reply_markup: {
                keyboard: [
                    ["30", "50", "100", "200"],
                    ["300", "500", "1000", "2000"],
                    ["Other", "❌ Cancel"]
                ],
                resize_keyboard: true
            }
        });
        return;
    }

    const amounts = ["30","50","100","200","300","500","1000","2000"];

    if (amounts.includes(text)) {
        bot.sendMessage(chatId,
`🏦 Bank:

Maybank
ABC COMPANY
123456789

Amount: RM${text}

Send receipt after transfer`);
        return;
    }
});


// ====== CONTACT ======
bot.on("contact", (msg) => {
    const chatId = msg.chat.id;
    const user = users[chatId];

    user.phone = msg.contact.phone_number;
    user.step = null;

    bot.sendMessage(chatId,
`✅ Registered Successfully

ID: ${user.member_id}
Name: ${user.name}
Phone: ${user.phone}
Balance: RM0`,
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
});
