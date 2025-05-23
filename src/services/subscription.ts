import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Update user subscription status
export const updateSubscriptionStatus = async (userId: string) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      hasActiveSubscription: true,
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

// Check if user has active subscription
export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.hasActiveSubscription || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw error;
  }
}; 