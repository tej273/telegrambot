const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

// ============================================================
//  CONFIGURATION - EDIT THESE VALUES
// ============================================================
const BOT_TOKEN = '8743651270:AAEoW1jDwp-Phow3LRX4TD31zzisCHR9UFQ';         // From @BotFather
const ADMIN_CHAT_ID = '7789057655'; // Your Telegram user ID

// Group/Channel links sent after approval
const GROUP_1_LINK = 'https://t.me/+FTwHllosLjtkNjVl'; // 390 plan group
const GROUP_2_LINK = 'https://t.me/+elCSXTQo0FozM2M1'; // 2000 plan group

// Group/Channel IDs for auto-removal (use negative numbers like -1001234567890)
const GROUP_1_ID = -1001234567890; // 390 plan group ID
// GROUP_2 members are NOT auto-removed (permanent plan)

// Payment QR image paths (put your QR images in the bot folder)
const QR_390_PATH  = '390.jpeg';   // QR code image for ₹390 plan
const QR_2000_PATH = '2000.jpeg';  // QR code image for ₹2000 plan

// UPI / Payment details shown with QR
const UPI_ID = 'tanujateja@slc'; // Your UPI ID

// Auto-removal timing
const THIRTY_DAYS_MS        = 30 * 24 * 60 * 60 * 1000; // 30 days
const TWENTY_NINE_DAYS_MS   = 29 * 24 * 60 * 60 * 1000; // 29 days (reminder)
// ============================================================

const bot = new Telegraf(BOT_TOKEN);

// ---------- Simple JSON file-based database ----------
const DB_FILE = './db.json';

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { users: {}, pendingApprovals: {} };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------- Keyboards ----------
function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🚀 START', 'start_main')],
  ]);
}

function planKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('💎 ₹390 Plan — Tajuna\'s Exclusive', 'plan_390')],
    [Markup.button.callback('👑 ₹2000 Plan — Tajuna\'s Private', 'plan_2000')],
    [Markup.button.callback('🔙 Back / START', 'start_main')],
  ]);
}

function uploadKeyboard(plan) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📤 Upload Payment Screenshot', `upload_ss_${plan}`)],
    [Markup.button.callback('🔙 Back / START', 'start_main')],
  ]);
}

function backKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back / START', 'start_main')],
  ]);
}

// Admin approval keyboard
function approvalKeyboard(userId, plan) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Approve', `approve_${userId}_${plan}`),
      Markup.button.callback('❌ Reject', `reject_${userId}_${plan}`),
    ],
  ]);
}

// ---------- Welcome / Start ----------
async function sendWelcome(ctx) {
  const name = ctx.from.first_name || 'Friend';
  await ctx.reply(
    `👋 Welcome, *${name}*!\n\n` +
    `🎯 This is *Tajuna's Premium Access Bot*.\n\n` +
    `Get exclusive access to our premium groups.\n\n` +
    `Press *START* to see available plans 👇`,
    {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    }
  );
}

bot.start((ctx) => sendWelcome(ctx));

// ---------- START button ----------
bot.action('start_main', async (ctx) => {
  await ctx.answerCbQuery();
  const name = ctx.from.first_name || 'Friend';
  await ctx.editMessageText(
    `👋 Hello, *${name}*!\n\n` +
    `Please choose your plan below:\n\n` +
    `💎 *₹390 — Tajuna\'s Exclusive*\n` +
    `_Premium short photos,videos & exclusive stuff_\n\n` +
    `👑 *₹2000 — Tajuna\'s Private*\n` +
    `_VIP access, fully 18+ &nu$3 content _\n`,
    {
      parse_mode: 'Markdown',
      ...planKeyboard(),
    }
  );
});

// ---------- ₹390 Plan ----------
bot.action('plan_390', async (ctx) => {
  await ctx.answerCbQuery();

  const planDetails =
    `💎 *Tajuna's Exclusive — ₹390*\n\n` +
    `✅ Access to *Tajuna's Exclusive* group\n` +
    `🔥 Fresh content drops everyday\n` +
    `🎬 Addictive short videos &  stuff\n` +
    `😎 Exclusive hot photos you won’t find anywhere else\n` +
    `👀 Sneak peeks & early access before others\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
     `👉 Perfect if you want daily entertainment without spending big.\n\n` +


    `💳 *UPI ID:* \`${UPI_ID}\`\n` +
    `💰 *Amount:* ₹390\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📲 Scan the QR code & pay ₹390`;

  if (fs.existsSync(QR_390_PATH)) {
    await ctx.replyWithPhoto(
      { source: QR_390_PATH },
      {
        caption: planDetails,
        parse_mode: 'Markdown',
        ...backKeyboard(),
      }
    );
  } else {
    await ctx.reply(planDetails, {
      parse_mode: 'Markdown',
      ...backKeyboard(),
    });
  }

  pendingUpload[ctx.from.id] = '390';
  await ctx.reply(
    `📸 *After payment, send your screenshot here!*\n\n` +
    `Make sure your screenshot shows:\n` +
    `• ✅ Transaction ID\n` +
    `• ✅ Amount: ₹390\n` +
    `• ✅ Date & Time\n\n` +
    `👇 Click below to upload or just *send the photo directly*`,
    {
      parse_mode: 'Markdown',
      ...uploadKeyboard('390'),
    }
  );
});

// ---------- ₹2000 Plan ----------
bot.action('plan_2000', async (ctx) => {
  await ctx.answerCbQuery();

  const planDetails =
    `👑 *Tajuna's Private — ₹2000*\n\n` +
    `🚀 Everything fully 18+ —  LEVELLED UP\n` +
    `🔥 Daily premium content (no limits)\n` +
    `💬 Direct content requests \n` +
    `✅ Early access to exclusive strategies\n` +
    `🎥 High-quality, carefully curated content\n` +
    `🎁 Surprise bonus drops every week\n` +
    `🎥 behind scenes &  n&d# content 💎\n\n` +
    `🎥fully 18+ & n&d# content 💎\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💳 *UPI ID:* \`${UPI_ID}\`\n` +
    `💰 *Amount:* ₹2000\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📲 Scan the QR code & pay ₹2000`;

  if (fs.existsSync(QR_2000_PATH)) {
    await ctx.replyWithPhoto(
      { source: QR_2000_PATH },
      {
        caption: planDetails,
        parse_mode: 'Markdown',
        ...backKeyboard(),
      }
    );
  } else {
    await ctx.reply(planDetails, {
      parse_mode: 'Markdown',
      ...backKeyboard(),
    });
  }

  pendingUpload[ctx.from.id] = '2000';
  await ctx.reply(
    `📸 *After payment, send your screenshot here!*\n\n` +
    `Make sure your screenshot shows:\n` +
    `• ✅ Transaction ID\n` +
    `• ✅ Amount: ₹2000\n` +
    `• ✅ Date & Time\n\n` +
    `👇 Click below to upload or just *send the photo directly*`,
    {
      parse_mode: 'Markdown',
      ...uploadKeyboard('2000'),
    }
  );
});

// ---------- Upload Screenshot button ----------
const pendingUpload = {}; // { userId: plan }

bot.action(/upload_ss_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const plan = ctx.match[1];
  const userId = ctx.from.id;
  pendingUpload[userId] = plan;

  await ctx.reply(
    `📸 *Please send your payment screenshot now!*\n\n` +
    `Just send the photo directly in this chat.\n` +
    `_Waiting for your screenshot..._`,
    {
      parse_mode: 'Markdown',
      ...backKeyboard(),
    }
  );
});

// ---------- Handle photo (payment screenshot) ----------
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const plan = pendingUpload[userId];

  if (!plan) {
    return ctx.reply('Please click a plan button first. Press START to begin.', backKeyboard());
  }

  delete pendingUpload[userId];

  const user = ctx.from;
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

  const db = loadDB();
  db.pendingApprovals[userId] = {
    userId,
    username: user.username || '',
    firstName: user.first_name || '',
    plan,
    fileId,
    timestamp: Date.now(),
  };
  saveDB(db);

  const planLabel = plan === '390' ? 'Tajuna\'s Exclusive (₹390)' : 'Tajuna\'s Private (₹2000)';

  await ctx.reply(
    `✅ *Screenshot received!*\n\n` +
    `Your payment for *${planLabel}* is under review.\n` +
    `You will receive your group link once approved by admin.\n\n` +
    `⏳ Please wait for approval...`,
    {
      parse_mode: 'Markdown',
      ...backKeyboard(),
    }
  );

  const adminMsg =
    `🔔 *New Payment Screenshot*\n\n` +
    `👤 Name: ${user.first_name} ${user.last_name || ''}\n` +
    `🆔 Username: @${user.username || 'N/A'}\n` +
    `🔢 User ID: \`${userId}\`\n` +
    `💰 Plan: ${planLabel}\n` +
    `🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
    caption: adminMsg,
    parse_mode: 'Markdown',
    ...approvalKeyboard(userId, plan),
  });
});

// ---------- Admin: Approve ----------
bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
  await ctx.answerCbQuery('✅ Approved!');
  const userId = parseInt(ctx.match[1]);
  const plan = ctx.match[2];

  const db = loadDB();
  const approval = db.pendingApprovals[userId];

  if (!approval) {
    return ctx.reply('⚠️ This request was already processed or not found.');
  }

  delete db.pendingApprovals[userId];

  db.users[userId] = {
    userId,
    plan,
    approvedAt: Date.now(),
    username: approval.username,
    firstName: approval.firstName,
  };
  saveDB(db);

  const groupLink  = plan === '390' ? GROUP_1_LINK : GROUP_2_LINK;
  const planName   = plan === '390' ? '💎 Tajuna\'s Exclusive' : '👑 Tajuna\'s Private';
  const accessNote = plan === '390'
    ? '\n\n🎊 Welcome to *Tajuna\'s Exclusive*! Enjoy your premium access.'
    : '\n\n🎊 Welcome to *Tajuna\'s Private*! You now have lifetime VIP access.';

  await bot.telegram.sendMessage(
    userId,
    `🎉 *Payment Approved!*\n\n` +
    `Your *${planName}* plan has been activated.\n\n` +
    `🔗 *Your Group Link:*\n${groupLink}${accessNote}\n\n` +
    `Thank you for joining! 🙏`,
    { parse_mode: 'Markdown', ...backKeyboard() }
  );

  await ctx.editMessageCaption(
    (ctx.callbackQuery.message.caption || '') +
    `\n\n✅ *APPROVED* by admin at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    { parse_mode: 'Markdown' }
  );

  // Schedule reminder + auto-removal for ₹390 plan only
  if (plan === '390') {

    // ── Reminder on Day 29 ──────────────────────────────────
    setTimeout(async () => {
      try {
        await bot.telegram.sendMessage(
          userId,
          `⚠️ *Reminder: Your access expires tomorrow!*\n\n` +
          `Your *Tajuna's Exclusive* membership is expiring in *24 hours*.\n\n` +
          `To continue enjoying premium access without interruption, renew your plan now! 👇`,
          { parse_mode: 'Markdown', ...mainMenuKeyboard() }
        );
      } catch (e) {
        console.error('Reminder error:', e.message);
      }
    }, TWENTY_NINE_DAYS_MS);

    // ── Auto-removal on Day 30 ──────────────────────────────
    setTimeout(async () => {
      try {
        await bot.telegram.banChatMember(GROUP_1_ID, userId);
        await bot.telegram.unbanChatMember(GROUP_1_ID, userId); // allow rejoin on new payment
        await bot.telegram.sendMessage(
          userId,
          `🔔 *Your membership has ended.*\n\n` +
          `Your *Tajuna's Exclusive* access has been deactivated.\n\n` +
          `We hope you enjoyed your time with us! 💙\n\n` +
          `To continue getting premium signals & tips, renew your plan below 👇`,
          { parse_mode: 'Markdown', ...mainMenuKeyboard() }
        );
        const db2 = loadDB();
        delete db2.users[userId];
        saveDB(db2);
      } catch (e) {
        console.error('Auto-removal error:', e.message);
      }
    }, THIRTY_DAYS_MS);
  }
});

// ---------- Admin: Reject ----------
bot.action(/reject_(\d+)_(.+)/, async (ctx) => {
  await ctx.answerCbQuery('❌ Rejected');
  const userId = parseInt(ctx.match[1]);
  const plan = ctx.match[2];

  const db = loadDB();
  delete db.pendingApprovals[userId];
  saveDB(db);

  const planLabel = plan === '390' ? 'Tajuna\'s Exclusive (₹390)' : 'Tajuna\'s Private (₹2000)';

  await bot.telegram.sendMessage(
    userId,
    `❌ *Payment Rejected*\n\n` +
    `Sorry, your payment screenshot for *${planLabel}* could not be verified.\n\n` +
    `Possible reasons:\n` +
    `• Screenshot was unclear\n` +
    `• Wrong amount paid\n` +
    `• Invalid transaction\n\n` +
    `Please try again or contact support.\n` +
    `Press START to retry 👇`,
    { parse_mode: 'Markdown', ...mainMenuKeyboard() }
  );

  await ctx.editMessageCaption(
    (ctx.callbackQuery.message.caption || '') +
    `\n\n❌ *REJECTED* by admin at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    { parse_mode: 'Markdown' }
  );
});

// ---------- Handle non-photo messages ----------
bot.on('message', async (ctx) => {
  const userId = ctx.from.id;
  if (pendingUpload[userId]) {
    return ctx.reply(
      '⚠️ Please send a *photo/screenshot* of your payment, not text.',
      { parse_mode: 'Markdown' }
    );
  }
});

// ---------- Launch ----------
bot.launch().then(() => {
  console.log('✅ Bot is running...');
}).catch((err) => {
  console.error('❌ Bot launch error:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
require('http').createServer((req, res) => {
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);
