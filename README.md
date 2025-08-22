# Telegram Mini App - Quest Rewards System

A simple gamified points/rewards system built as a Telegram Mini App, featuring a Beincom signup quest with 3-state buttons (DO/CLAIM/CLAIMED).

## 🏗️ Architecture

- **Backend**: Node.js + Express + Redis
- **Frontend**: React + Vite + TypeScript
- **Bot**: Telegram Bot API
- **Storage**: Redis for user data and quest states

## 📁 Project Structure

```
telegram-bot/
├── backend/          # Express API server
├── frontend/         # React Mini App
├── bot/             # Telegram Bot
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Redis server
- Telegram Bot Token

### 1. Setup Redis

```bash
# Install and start Redis
sudo apt-get install redis-server
sudo systemctl start redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Update with your settings
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Setup Bot

```bash
cd bot
npm install
cp .env.example .env  # Add your BOT_TOKEN
npm start
```

## 🔧 Configuration

### Backend (.env)
```
PORT=3001
REDIS_URL=redis://localhost:6379
BOT_TOKEN=your_telegram_bot_token_here
```

### Bot (.env)
```
BOT_TOKEN=your_telegram_bot_token_here
WEBAPP_URL=https://your-mini-app-domain.com
```

## 🎮 Features

### Quest System
- **DO**: Initial state, opens Beincom signup link
- **CLAIM**: Quest completed, user can claim reward points
- **CLAIMED**: Reward already claimed, button disabled

### Beincom Integration
- Signup link: `http://beincom.com/signup?partyId=tele-bot&uid={user_telegram_id}`
- Reward: 100 points for successful signup

## 📱 Usage

1. Start the bot: `/start`
2. Click "Open Mini App" button
3. Complete the Beincom signup quest
4. Claim your 100 points reward

## 🛠️ Development

### Running in Development

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Backend
cd backend && npm start

# Terminal 3: Start Frontend
cd frontend && npm run dev

# Terminal 4: Start Bot (optional for local testing)
cd bot && npm start
```

### Testing the Flow

1. Open `http://localhost:3000` in your browser
2. The app will use a mock user ID for development
3. Test the quest flow: DO → CLAIM → CLAIMED

## 🌐 Deployment

1. Deploy frontend to a hosting service (Vercel, Netlify, etc.)
2. Deploy backend to a cloud provider (Railway, Heroku, etc.)
3. Update bot's WEBAPP_URL with your frontend URL
4. Set up Redis database in production
5. Configure your Telegram bot with the webhook URL

## 📝 API Endpoints

- `GET /api/user/:telegramId` - Get user data
- `GET /api/quests/:telegramId` - Get quest list
- `POST /api/quest/verify` - Mark quest as completed
- `POST /api/quest/claim` - Claim quest reward

## 🔐 Security Notes

- In production, validate Telegram WebApp data
- Use HTTPS for all communications
- Implement rate limiting for API endpoints
- Secure your Redis instance