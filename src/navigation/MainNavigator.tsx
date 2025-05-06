import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/home/Home';
import HistoryScreen from '../screens/history/History';
import ProfileScreen from '../screens/profile/Profile';
import ChatScreen from '../screens/chat/Chat';

// Import icons (you'll need to add these)
// import { HomeIcon, SensorIcon, HistoryIcon, ProfileIcon } from '../components/icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
          paddingTop: 5,
          height: Platform.OS === 'android' ? 60 : 80,
          paddingBottom: Platform.OS === 'android' ? 10 : 5,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -2 },
          // Add safe area insets for Android
          safeAreaInsets: { bottom: 0 },
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
          paddingBottom: Platform.OS === 'android' ? 5 : 0,
        },
      }}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default MainNavigator; 