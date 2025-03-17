import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAGQyntNngySchZrkxb4xpi5VsOq0JGkxM",
  authDomain: "lullaby-smart.firebaseapp.com",
  projectId: 'lullaby-smart',
  storageBucket: 'lullaby-smart.firebasestorage.app',
  messagingSenderId: '723095304506',
  appId: '1:723095304506:web:e7422643202d9ae575b803',
  //measurementId: 'G-VLGWKQ9ME7',
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
