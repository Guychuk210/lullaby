import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';
import { subscribeToAuthChanges, getCurrentUserData } from '../services/auth';

interface AuthHook {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('useAuth hook rendered');

  useEffect(() => {
    console.log('useAuth effect running - setting up auth listener');
    
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser: FirebaseUser | null) => {
      console.log('Auth state changed in useAuth hook:', firebaseUser?.email);
      setIsLoading(true);
      try {
        if (firebaseUser) {
          // User is signed in
          console.log('User signed in with ID:', firebaseUser.uid);
          
          // Try to get user data, with retry logic for race condition
          let userData = await getCurrentUserData(firebaseUser.uid);
          
          // If no userData found for a newly authenticated user, retry a few times
          // This handles the race condition where Firebase Auth succeeds before Firestore document is created
          if (!userData) {
            console.log('useAuth: No user data found on first attempt, retrying...');
            
            // Retry up to 3 times with delays
            for (let attempt = 1; attempt <= 3; attempt++) {
              console.log(`useAuth: Retry attempt ${attempt}/3`);
              
              // Wait before retrying (increasing delay)
              await new Promise(resolve => setTimeout(resolve, attempt * 1000));
              
              userData = await getCurrentUserData(firebaseUser.uid);
              if (userData) {
                console.log(`useAuth: User data found on retry attempt ${attempt}!`);
                break;
              }
            }
          }
          
          if (userData) {
            console.log('Retrieved user data:', userData);
            setUser(userData);
          } else {
            console.log('useAuth: Still no user data after retries, setting user to null');
            setUser(null);
          }
        } else {
          // User is signed out
          console.log('User is signed out - setting user to null');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to get user data');
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('useAuth effect cleanup - unsubscribing from auth changes');
      unsubscribe();
    };
  }, []);

  return { user, isLoading, error };
} 