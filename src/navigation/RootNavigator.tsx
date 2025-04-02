import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import screens (we'll create these later)
import SensorSetupScreen from '../screens/sensor/SensorSetup';
import NotificationsScreen from '../screens/notifications/Notifications';
import SettingsScreen from '../screens/settings/Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
  hasSubscription: boolean;
}

function RootNavigator({ isAuthenticated, hasSubscription }: RootNavigatorProps) {
  // Add logging to monitor prop changes
  console.log('RootNavigator rendered with:', { isAuthenticated, hasSubscription });
  
  useEffect(() => {
    console.log('RootNavigator auth/subscription status changed:', { isAuthenticated, hasSubscription });
  }, [isAuthenticated, hasSubscription]);

  // Determine the initial route based on authentication and subscription
  const initialRoute = isAuthenticated && hasSubscription ? 'Main' : 'Auth';
  console.log('Setting initial route to:', initialRoute);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRoute}
    >
      {!isAuthenticated || !hasSubscription ? (
        <>
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator} 
            listeners={{
              focus: () => console.log('Auth Navigator focused'),
              blur: () => console.log('Auth Navigator blurred'),
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            listeners={{
              focus: () => console.log('Main Navigator focused'),
              blur: () => console.log('Main Navigator blurred'),
            }}
          />
          <Stack.Screen name="SensorSetup" component={SensorSetupScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator; 