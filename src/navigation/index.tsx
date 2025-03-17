import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './RootNavigator';
import { useAuth } from '../hooks/useAuth';

function Navigation() {
  // We'll implement this hook later
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator isAuthenticated={isAuthenticated} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Navigation; 