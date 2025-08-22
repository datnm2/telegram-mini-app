// Simple mock API for Netlify Functions
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  
  try {
    // Mock user data
    if (path.startsWith('/user/')) {
      const telegramId = path.split('/')[2];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          telegramId,
          points: 2500
        })
      };
    }

    // Mock quests data
    if (path.startsWith('/quests/')) {
      const telegramId = path.split('/')[2];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          quests: [
            {
              id: 'beincom',
              title: 'Join Beincom Community',
              description: 'Follow @beincom on social media and join our community',
              reward: 500,
              status: 'DO',
              url: 'https://beincom.org'
            },
            {
              id: 'follow',
              title: 'Follow on Twitter',
              description: 'Follow our official Twitter account',
              reward: 300,
              status: 'CLAIM',
              url: 'https://twitter.com/beincom'
            }
          ]
        })
      };
    }

    // Handle quest actions
    if (path === '/quest/verify' || path === '/quest/claim') {
      const body = JSON.parse(event.body || '{}');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: path.includes('verify') ? 'verified' : 'claimed',
          message: 'Success'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};