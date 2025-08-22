const express = require('express');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Redis client setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Connect to Redis
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// User data helpers
async function getUserData(telegramId) {
  try {
    const userData = await redisClient.get(`user:${telegramId}`);
    if (!userData) {
      // Create new user
      const newUser = {
        telegramId,
        points: 0,
        quests: {
          beincom: 'DO' // DO, CLAIM, CLAIMED
        },
        createdAt: new Date().toISOString()
      };
      await redisClient.set(`user:${telegramId}`, JSON.stringify(newUser));
      return newUser;
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

async function updateUserData(telegramId, userData) {
  try {
    await redisClient.set(`user:${telegramId}`, JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Telegram Mini App Backend' });
});

// Get user data
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const userData = await getUserData(telegramId);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Get quest list
app.get('/api/quests/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const userData = await getUserData(telegramId);
    
    const quests = [{
      id: 'beincom',
      title: 'Signup Beincom',
      description: 'Join Beincom platform and earn 100 points',
      reward: 100,
      status: userData.quests.beincom,
      url: `http://beincom.com/signup?partyId=tele-bot&uid=${telegramId}`
    }];
    
    res.json({ quests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quests' });
  }
});

// Mark quest as completed (move from DO to CLAIM)
app.post('/api/quest/verify', async (req, res) => {
  try {
    const { telegramId, questId } = req.body;
    
    if (questId !== 'beincom') {
      return res.status(400).json({ error: 'Invalid quest ID' });
    }
    
    const userData = await getUserData(telegramId);
    
    if (userData.quests.beincom === 'DO') {
      userData.quests.beincom = 'CLAIM';
      await updateUserData(telegramId, userData);
      res.json({ status: 'verified', message: 'Quest completed! You can now claim your reward.' });
    } else {
      res.json({ status: 'already_verified', message: 'Quest already completed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify quest' });
  }
});

// Claim quest reward (move from CLAIM to CLAIMED)
app.post('/api/quest/claim', async (req, res) => {
  try {
    const { telegramId, questId } = req.body;
    
    if (questId !== 'beincom') {
      return res.status(400).json({ error: 'Invalid quest ID' });
    }
    
    const userData = await getUserData(telegramId);
    
    if (userData.quests.beincom === 'CLAIM') {
      userData.quests.beincom = 'CLAIMED';
      userData.points += 100; // Add reward points
      await updateUserData(telegramId, userData);
      res.json({ 
        status: 'claimed', 
        message: 'Reward claimed successfully!', 
        points: userData.points 
      });
    } else if (userData.quests.beincom === 'CLAIMED') {
      res.json({ status: 'already_claimed', message: 'Reward already claimed' });
    } else {
      res.status(400).json({ error: 'Quest not ready for claiming' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim quest reward' });
  }
});

// Start server
async function startServer() {
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);