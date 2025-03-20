// Test script for creating a bed-wetting event
import { createEvent } from './src/services/events';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

async function createTestEvent() {
  try {
    // Test user and device IDs
    const userId = 'test-user-123';
    const deviceId = 'test-device-456';
    
    // Create event using our service function
    const event = await createEvent(
      userId,
      deviceId,
      Date.now(),
      'medium',
      'This is a test event created from the TypeScript test script'
    );
    
    console.log('Event created successfully:', event);
    return event.id;
  } catch (error) {
    console.error('Error creating test event:', error);
    throw error;
  }
}

// Call the function
createTestEvent()
  .then(eventId => {
    console.log('Test event created with ID:', eventId);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to create test event:', error);
    process.exit(1);
  }); 