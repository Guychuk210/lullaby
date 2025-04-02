import 'dotenv/config';

export default {
  expo: {
    name: 'Lullaby',
    slug: 'lullaby',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      // Firebase config
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      
      // Gemini config
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      
      // API URL for backend services
      API_URL: process.env.API_URL || 'http://10.100.102.14:3001/api',
      
      // Vertex AI config
      VERTEX_AI_PROJECT_ID: process.env.VERTEX_AI_PROJECT_ID || '284266420931',
      VERTEX_AI_LOCATION: process.env.VERTEX_AI_LOCATION || 'global',
      VERTEX_AI_ENGINE_ID: process.env.VERTEX_AI_ENGINE_ID || 'bed-wetting-expert_1743595681051',
    }
  },
}; 