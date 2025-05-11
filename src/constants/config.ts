import Constants from 'expo-constants';

// API Keys and configuration
export const config = {
  gemini: {
    apiKey: Constants.expoConfig?.extra?.GEMINI_API_KEY || '', // Set this in your app.config.js file
  },

  apiUrl: __DEV__ 
    ? 'http://172.20.10.9:3001/api'  // Local development
    : 'https://lullaby-server.vercel.app/api',  // Production
}; 