import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.PROD 
  ? 'https://telegram-mini-app-demo.netlify.app/.netlify/functions/api' 
  : 'http://localhost:3001/api'

interface Quest {
  id: string
  title: string
  description: string
  reward: number
  status: 'DO' | 'CLAIM' | 'CLAIMED'
  url: string
}

interface UserData {
  telegramId: string
  points: number
  quests: {
    beincom: 'DO' | 'CLAIM' | 'CLAIMED'
  }
}

function App() {
  const [user, setUser] = useState<UserData | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [])

  // Get Telegram user ID (mock for development)
  const getTelegramUserId = (): string => {
    // In production, this would come from Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString()
    }
    // Mock user ID for development
    return '123456789'
  }

  const fetchUserData = async () => {
    try {
      const telegramId = getTelegramUserId()
      const [userResponse, questsResponse] = await Promise.all([
        axios.get(`${API_BASE}/user/${telegramId}`),
        axios.get(`${API_BASE}/quests/${telegramId}`)
      ])

      console.log('userResponse:', userResponse.data)
      console.log('questsResponse:', questsResponse.data)
      
      setUser(userResponse.data)
      setQuests(questsResponse.data.quests)
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestAction = async (quest: Quest) => {
    const telegramId = getTelegramUserId()

    try {
      if (quest.status === 'DO') {
        // Open external link
        window.open(quest.url, '_blank')
        
        // Simulate quest completion verification after a delay
        setTimeout(async () => {
          try {
            await axios.post(`${API_BASE}/quest/verify`, {
              telegramId,
              questId: quest.id
            })
            // Refresh data to show CLAIM state
            await fetchUserData()
          } catch (err) {
            console.error('Error verifying quest:', err)
          }
        }, 2000) // 2 second delay to simulate external action
        
      } else if (quest.status === 'CLAIM') {
        // Claim reward
        const response = await axios.post(`${API_BASE}/quest/claim`, {
          telegramId,
          questId: quest.id
        })
        
        if (response.data.status === 'claimed') {
          // Refresh data to show updated points and CLAIMED state
          await fetchUserData()
        }
      }
    } catch (err) {
      setError('Failed to process quest action')
      console.error('Error processing quest:', err)
    }
  }

  const getButtonText = (status: string): string => {
    switch (status) {
      case 'DO':
        return 'Start Quest'
      case 'CLAIM':
        return 'Claim Reward'
      case 'CLAIMED':
        return 'Completed ✓'
      default:
        return 'Unknown'
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
        <button 
          onClick={() => {
            setError(null)
            setLoading(true)
            fetchUserData()
          }}
          className="quest-button do"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Quest Rewards</h1>
        <div className="points">{user?.points || 0} Points</div>
      </div>

      <div className="quest-list">
        {quests.map((quest) => (
          <div key={quest.id} className="quest-card">
            <div className="quest-title">{quest.title}</div>
            <div className="quest-description">{quest.description}</div>
            <div className="quest-reward">Reward: {quest.reward} points</div>
            
            <button
              className={`quest-button ${quest.status.toLowerCase()}`}
              onClick={() => handleQuestAction(quest)}
              disabled={quest.status === 'CLAIMED'}
            >
              {getButtonText(quest.status)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App