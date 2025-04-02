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
          const userData = await getCurrentUserData(firebaseUser.uid);
          console.log('Retrieved user data:', userData);
          setUser(userData);
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