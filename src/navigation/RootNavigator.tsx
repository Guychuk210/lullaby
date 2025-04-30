import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import screens
import SensorSetupScreen from '../screens/sensor/SensorSetup';
import NotificationsScreen from '../screens/notifications/Notifications';
import SettingsScreen from '../screens/settings/Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  // Simple navigator with all screens available, no auth checking
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Auth"
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