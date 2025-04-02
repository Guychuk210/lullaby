import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './RootNavigator';
import { useAuth } from '../hooks/useAuth';
import { checkSubscriptionStatus } from '../services/subscription';
import { auth } from '../services/firebase';

function Navigation() {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Add logging for debugging
  console.log('Navigation component rendering');
  console.log('User state:', user ? `User ${user.id} (${user.email})` : 'No user');

  useEffect(() => {
    console.log('Navigation useEffect running for user:', user?.id);
    
    // Debug auth state globally
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log('Global auth state changed:', firebaseUser?.email);
    });
    
    const checkSubscription = async () => {
      if (user?.id) {
        console.log('Checking subscription for user:', user.id);
        try {
          const hasActiveSubscription = await checkSubscriptionStatus(user.id);
          console.log('User subscription status:', hasActiveSubscription);
          setHasSubscription(hasActiveSubscription);
        } catch (error) {
          console.error('Error checking subscription in Navigation:', error);
        }
      } else {
        console.log('No user to check subscription for');
        setHasSubscription(false);
      }
    };
    
    checkSubscription();
    
    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator 
          isAuthenticated={!!user} 
          hasSubscription={hasSubscription} 
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Navigation; 