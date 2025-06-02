import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import screens
import SensorSetupScreen from '../screens/sensor/SensorSetup';
import NotificationsScreen from '../screens/notifications/Notifications';
import SettingsScreen from '../screens/settings/Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, isLoading } = useAuth();
  
  console.log('RootNavigator rendering with:', { 
    user: user ? `${user.email} (${user.id})` : null, 
    isLoading 
  });
  
  // Show loading indicator while checking authentication status
  if (isLoading) {
    console.log('RootNavigator: Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log('RootNavigator: Rendering navigation with user authenticated:', !!user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        // User is authenticated - show main app screens
        <>
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
          />
          <Stack.Screen name="SensorSetup" component={SensorSetupScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        // User is not authenticated - show auth screens
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
        />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator; 