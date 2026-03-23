console.log("🚀 BOT STARTED");
bot.on("message", (msg) => {
    console.log("📩 MSG:", msg.text);
});
const TelegramBot = require('node-telegram-bot-api');
const admin = require("firebase-admin");

// 🔥 Firebase
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ===== TELEGRAM =====
const token ='8721828503:AAH-fdnsPJkjTeDKqd9oj4UHvXQOMjaJeRc';
const bot = new TelegramBot(token, { polling: true });

let users = {};


// ====== START ======
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // 🔥 先查 Firebase
    const userRef = db.collection("users").doc(String(chatId));
    const userDoc = await userRef.get();

    // 👉 如果 Firebase 有 → 直接当已注册
    if (userDoc.exists) {
        const data = userDoc.data();

        users[chatId] = data;

        bot.sendMessage(chatId,
`👋 Welcome back ${data.member_id}

👤 ${data.name}
💰 Balance: RM${data.balance}`,
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

    // 👉 Firebase 没有 → 创建新用户（本地）
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


// ====== BUTTON ======
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const user = users[chatId];

    if (user.phone && user.name) {
        bot.sendMessage(chatId, "⚠️ Already registered");
        return;
    }

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

    if (data === "register") {
        user.step = "name";

        bot.sendMessage(chatId,
`📝 Please enter your FULL NAME (Bank Account Name)`);
    }
});


// ====== MESSAGE ======
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") return;
    if (!users[chatId]) return;

    const user = users[chatId];

    // ===== 名字 =====
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

    // ===== 确认 =====
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
            bot.sendMessage(chatId, "❗ Re-enter name:");
        }

        return;
    }

    // ===== Deposit =====
    if (text === "💰 Deposit") {
        bot.sendMessage(chatId, "Minimum RM30");
        return;
    }
});


// ====== CONTACT（🔥重点：写入 Firebase）=====
bot.on("contact", async (msg) => {
    const chatId = msg.chat.id;
    const user = users[chatId];

    user.phone = msg.contact.phone_number;
    user.step = null;

    // 🔥 存进 Firebase
    await db.collection("users").doc(String(chatId)).set({
        telegram_id: user.telegram_id,
        member_id: user.member_id,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        created_at: new Date()
    });

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
