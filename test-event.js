// Test script for creating a bed-wetting event
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - replace with your own
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
const db = getFirestore(app);

async function createTestEvent() {
  try {
    // Test user and device IDs
    const userId = 'test-user-123';
    const deviceId = 'test-device-456';
    
    // Create event data
    const eventData = {
      userId,
      deviceId,
      timestamp: Date.now(),
      intensity: 'medium',
      notes: 'This is a test event created from the test script',
      isResolved: false,
      alertSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add document to Firestore
    const docRef = await addDoc(collection(db, 'bedWettingEvents'), eventData);
    
    console.log('Event created successfully with ID:', docRef.id);
    return docRef.id;
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