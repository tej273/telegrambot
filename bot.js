const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

// ================= ENV =================
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// ================= LINKS =================
const GROUP_1_LINK = 'https://t.me/+FTwHllosLjtkNjVl';
const GROUP_2_LINK = 'https://t.me/+elCSXTQo0FozM2M1';

const GROUP_1_ID = -1001234567890;

const QR_390_PATH = '390.jpeg';
const QR_2000_PATH = '2000.jpeg';

const UPI_ID = 'tanujateja@slc';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TWENTY_NINE_DAYS_MS = 29 * 24 * 60 * 60 * 1000;

// ================= BOT =================
const bot = new Telegraf(BOT_TOKEN);

// ⚠️ IMPORTANT: must be GLOBAL
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
  Markup.inlineKeyboard([[Markup.button.callback('🚀 START', 'start_main')]]);

const planKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💎 ₹390 Plan', 'plan_390')],
    [Markup.button.callback('👑 ₹2000 Plan', 'plan_2000')],
  ]);

// ================= START =================
bot.start((ctx) => {
  ctx.reply(`Welcome ${ctx.from.first_name}`, mainMenuKeyboard());
});

// ================= MENU =================
bot.action('start_main', async (ctx) => {
  try {
    await ctx.answerCbQuery();

    await ctx.editMessageText(
      `Choose Plan:`,
      { ...planKeyboard() }
    );
  } catch (e) {
    console.log("edit error ignored");
  }
});

// ================= PLAN 390 =================
bot.action('plan_390', async (ctx) => {
  await ctx.answerCbQuery();

  pendingUpload[ctx.from.id] = '390';

  await ctx.reply(
    `💎 Pay ₹390 to UPI: ${UPI_ID}`,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Upload Screenshot', 'upload_390')],
      ]),
    }
  );
});

// ================= PLAN 2000 =================
bot.action('plan_2000', async (ctx) => {
  await ctx.answerCbQuery();

  pendingUpload[ctx.from.id] = '2000';

  await ctx.reply(
    `👑 Pay ₹2000 to UPI: ${UPI_ID}`,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Upload Screenshot', 'upload_2000')],
      ]),
    }
  );
});

// ================= UPLOAD TRIGGERS =================
bot.action(/upload_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  pendingUpload[ctx.from.id] = ctx.match[1];

  ctx.reply("Send screenshot now 📸");
});

// ================= PHOTO =================
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const plan = pendingUpload[userId];

  if (!plan) return ctx.reply("First choose plan");

  delete pendingUpload[userId];

  const fileId = ctx.message.photo.at(-1).file_id;

  const db = loadDB();
  db.pendingApprovals[userId] = { plan, fileId };
  saveDB(db);

  await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
    caption: `New payment ${plan}`,
  });

  ctx.reply("Wait for approval");
});

// ================= LAUNCH =================
bot.launch();

console.log("BOT RUNNING");
