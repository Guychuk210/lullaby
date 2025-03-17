import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/Home';
import SensorScreen from '../screens/sensor/Sensor';
import HistoryScreen from '../screens/history/History';
import ProfileScreen from '../screens/profile/Profile';

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
          height: 80,
          paddingBottom: 5,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
        },
      }}
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
        name="Sensor" 
        component={SensorScreen} 
        options={{
          tabBarLabel: 'Sensor',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" color={color} size={size} />
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