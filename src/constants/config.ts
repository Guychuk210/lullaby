import Constants from 'expo-constants';

// API Keys and configuration
export const config = {
  gemini: {
    apiKey: Constants.expoConfig?.extra?.GEMINI_API_KEY || '', // Set this in your app.config.js file
  },

  apiUrl: __DEV__ ? 'http://10.100.102.12:3001/api' : 'https://your-production-api.com/api',
}; 