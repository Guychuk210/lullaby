import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  notificationCount?: number;
  onNotificationPress?: () => void;
}

function Header({ notificationCount = 0, onNotificationPress }: HeaderProps) {
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Default navigation to notifications screen
      navigation.navigate('Main', { screen: 'History' });
    }
  };

  return (
    <View style={styles.header}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <Text style={styles.title}>Lullaby.AI</Text>
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={handleNotificationPress}
      >
        <Ionicons name="notifications" size={24} color={colors.text} />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>
              {notificationCount > 9 ? '9+' : notificationCount}
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