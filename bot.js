const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const GROUP_1_LINK = 'https://t.me/+FTwHllosLjtkNjVl';
const GROUP_2_LINK = 'https://t.me/+elCSXTQo0FozM2M1';

const GROUP_1_ID = -1001234567890;

const QR_390_PATH = '390.jpeg';
const QR_2000_PATH = '2000.jpeg';

const UPI_ID = 'tanujateja@slc';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TWENTY_NINE_DAYS_MS = 29 * 24 * 60 * 60 * 1000;

// ================= INIT =================
const bot = new Telegraf(BOT_TOKEN);
const pendingUpload = {};

// ================= DB =================
const DB_FILE = './db.json';

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { users: {}, pendingApprovals: {} };
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ================= KEYBOARDS =================
const mainMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 START', 'start_main')],
  ]);

const planKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💎 ₹390 Plan — Exclusive', 'plan_390')],
    [Markup.button.callback('👑 ₹2000 Plan — Private', 'plan_2000')],
    [Markup.button.callback('🔙 START', 'start_main')],
  ]);

const backKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔙 START', 'start_main')],
  ]);

// ================= START =================
bot.start(async (ctx) => {
  await ctx.reply(
    `👋 Welcome ${ctx.from.first_name}\n\nPremium Bot`,
    mainMenuKeyboard()
  );
});

// ================= MENU =================
bot.action('start_main', async (ctx) => {
  await ctx.answerCbQuery();

  try {
    await ctx.editMessageText(
      `🎯 Choose Your Plan:\n\n💎 ₹390\n👑 ₹2000`,
      planKeyboard()
    );
  } catch {
    ctx.reply("Menu:", planKeyboard());
  }
});

// ================= 390 PLAN =================
bot.action('plan_390', async (ctx) => {
  await ctx.answerCbQuery();

  const msg =
    `💎 ₹390 PLAN\n\n` +
    `UPI: ${UPI_ID}\n\n` +
    `Scan QR & Pay`;

  if (fs.existsSync(QR_390_PATH)) {
    await ctx.replyWithPhoto(
      { source: QR_390_PATH },
      { caption: msg, ...backKeyboard() }
    );
  } else {
    await ctx.reply(msg, backKeyboard());
  }

  pendingUpload[ctx.from.id] = '390';

  await ctx.reply(
    `📸 Send screenshot after payment`,
    Markup.inlineKeyboard([
      [Markup.button.callback('Upload Screenshot', 'upload_390')],
    ])
  );
});

// ================= 2000 PLAN =================
bot.action('plan_2000', async (ctx) => {
  await ctx.answerCbQuery();

  const msg =
    `👑 ₹2000 PLAN\n\n` +
    `UPI: ${UPI_ID}\n\n` +
    `Scan QR & Pay`;

  if (fs.existsSync(QR_2000_PATH)) {
    await ctx.replyWithPhoto(
      { source: QR_2000_PATH },
      { caption: msg, ...backKeyboard() }
    );
  } else {
    await ctx.reply(msg, backKeyboard());
  }

  pendingUpload[ctx.from.id] = '2000';

  await ctx.reply(
    `📸 Send screenshot after payment`,
    Markup.inlineKeyboard([
      [Markup.button.callback('Upload Screenshot', 'upload_2000')],
    ])
  );
});

// ================= UPLOAD =================
bot.action(/upload_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  pendingUpload[ctx.from.id] = ctx.match[1];
  ctx.reply("📸 Send screenshot now");
});

// ================= PHOTO HANDLER =================
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const plan = pendingUpload[userId];

  if (!plan) return ctx.reply("Select plan first");

  delete pendingUpload[userId];

  const fileId = ctx.message.photo.at(-1).file_id;

  const db = loadDB();
  db.pendingApprovals[userId] = { plan, fileId };
  saveDB(db);

  await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
    caption: `New Payment Request (${plan})`,
  });

  ctx.reply("⏳ Waiting for approval");
});

// ================= APPROVE =================
bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
  await ctx.answerCbQuery("Approved");

  const userId = ctx.match[1];
  const plan = ctx.match[2];

  const link = plan === '390' ? GROUP_1_LINK : GROUP_2_LINK;

  await bot.telegram.sendMessage(
    userId,
    `✅ Approved!\nJoin: ${link}`
  );
});

// ================= LAUNCH =================
bot.launch();
console.log("BOT RUNNING");
