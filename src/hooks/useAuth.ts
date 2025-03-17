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

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          // User is signed in
          const userData = await getCurrentUserData(firebaseUser.uid);
          setUser(userData);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (err) {
        setError('Failed to get user data');
        console.error('Auth state change error:', err);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, isLoading, error };
} 