import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';

interface HeaderProps {
  notificationCount?: number;
  onNotificationPress?: () => void;
  useCustomNotifications?: boolean; // Flag to control whether to use the hook or passed props
}

function Header({ notificationCount, onNotificationPress, useCustomNotifications = false }: HeaderProps) {
  const navigation = useNavigation<any>(); // Use any type to avoid type errors with navigation
  
  // Always use the notifications hook to get the accurate unread count
  const { unreadCount } = useNotifications();
  
  // Use the hook's unreadCount directly for display
  const displayCount = unreadCount;

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      // Use custom handler if provided
      onNotificationPress();
    } else {
      // Navigate to Chat screen and show notifications section
      navigation.navigate('Main', { 
        screen: 'Chat',
        params: { showNotifications: true }
      });
    }
  };

  // Add debug log to verify the unread count
  console.log('[Header] Unread notification count:', displayCount);

  return (
    <View style={styles.header}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <Text style={styles.title}>Numah.AI</Text>
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={handleNotificationPress}
      >
        <Ionicons name="notifications" size={24} color={colors.text} />
        {displayCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>
              {displayCount > 9 ? '9+' : displayCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header; 