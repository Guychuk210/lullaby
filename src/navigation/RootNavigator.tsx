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
  
  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={user ? "Main" : "Auth"}
    >
      <Stack.Screen 
        name="Auth" 
        component={AuthNavigator} 
      />
      <Stack.Screen 
        name="Main" 
        component={MainNavigator}
      />
      <Stack.Screen name="SensorSetup" component={SensorSetupScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default RootNavigator; 