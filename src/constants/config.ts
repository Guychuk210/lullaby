import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine correct API URL based on platform
const getApiUrl = () => {
  // When running in an emulator or on a real device, localhost/127.0.0.1 refers to the device itself, not your computer
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 (special IP for the host from the emulator)
    return __DEV__ ? 'http://10.0.2.2:3000/api' : 'https://your-production-api.com/api';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, use localhost
    return __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';
  } else {
    // For web, use localhost
    return __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';
  }
};

// API Keys and configuration
export const config = {
  gemini: {
    apiKey: Constants.expoConfig?.extra?.GEMINI_API_KEY || '', // Set this in your app.config.js file
  },
  apiUrl: getApiUrl(),
}; 