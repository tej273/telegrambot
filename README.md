# 🤖 Telegram Payment Bot — Setup Guide

## 📁 Files in this folder
- `bot.js` — Main bot code
- `package.json` — Dependencies
- `qr_499.jpg` — Your ₹499 QR code image (add this yourself)
- `qr_2000.jpg` — Your ₹2000 QR code image (add this yourself)
- `db.json` — Auto-created database (users & pending approvals)

---

## ✅ Step-by-Step Setup

### 1. Install Node.js
Download from: https://nodejs.org (version 18 or above)

### 2. Create your Telegram Bot
1. Open Telegram → search `@BotFather`
2. Send `/newbot`
3. Give it a name and username
4. Copy the **Bot Token** you receive

### 3. Get your Admin Chat ID
1. Search `@userinfobot` on Telegram
2. Send `/start`
3. Copy your **ID number**

### 4. Edit `bot.js` — Fill in your details
Open `bot.js` and edit the CONFIGURATION section at the top:

```js
const BOT_TOKEN     = 'YOUR_BOT_TOKEN_HERE';        // From BotFather
const ADMIN_CHAT_ID = 'YOUR_ADMIN_CHAT_ID_HERE';    // Your Telegram ID

const GROUP_1_LINK  = 'https://t.me/+YOUR_INVITE';  // ₹499 group invite link
const GROUP_2_LINK  = 'https://t.me/+YOUR_INVITE';  // ₹2000 group invite link

const GROUP_1_ID    = -1001234567890;               // ₹499 group ID (for auto-remove)

const UPI_ID        = 'yourname@upi';               // Your UPI ID
```

### 5. Get Group IDs
- Add `@userinfobot` to your group
- It will show the group's negative ID like `-1001234567890`
- Use that as `GROUP_1_ID`

### 6. Add your Bot as Admin to Groups
- Go to your group → Settings → Administrators
- Add your bot as admin with **"Remove Members"** permission
  (Required for 30-day auto-removal to work)

### 7. Add QR Code Images
- Save your ₹499 payment QR as `qr_499.jpg` in the bot folder
- Save your ₹2000 payment QR as `qr_2000.jpg` in the bot folder

### 8. Install & Run

```bash
# Open terminal in the bot folder
npm install

# Start the bot
npm start
```

---

## 🔄 How the Bot Works

```
User clicks /start
    ↓
START button appears
    ↓
User clicks START → sees two plans
    ↓
User picks ₹499 or ₹2000
    ↓
QR code appears with payment instructions
    ↓
User clicks "Upload Payment Screenshot"
    ↓
User sends photo of payment
    ↓
Admin receives screenshot with Approve/Reject buttons
    ↓
Admin clicks Approve → Group link sent to user
Admin clicks Reject  → User notified to retry
    ↓
For ₹499 plan: after 30 days → user auto-removed from group
```

---

## 💡 Tips

- Keep the bot running 24/7 using **PM2**:
  ```bash
  npm install -g pm2
  pm2 start bot.js --name mybot
  pm2 save
  pm2 startup
  ```

- Or host it for free on **Railway.app** or **Render.com**

- ⚠️ The 30-day timer resets if the bot restarts! For production use, store timers in a real database (MongoDB/PostgreSQL) and check on bot startup.

---

## ⚠️ Important Notes

1. The bot must be **admin** in your group to remove users
2. Group invite links should be set to **"Never Expire"** in group settings
3. For the 30-day auto-removal to survive bot restarts, upgrade to a database (ask for help if needed)
4. Keep `db.json` backed up — it stores all user data
