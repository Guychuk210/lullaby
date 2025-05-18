import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGQyntNngySchZrkxb4xpi5VsOq0JGkxM",
  authDomain: "lullaby-smart.firebaseapp.com",
  projectId: "lullaby-smart",
  storageBucket: "lullaby-smart.firebasestorage.app",
  messagingSenderId: "723095304506",
  appId: "1:723095304506:web:e7422643202d9ae575b803",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;
