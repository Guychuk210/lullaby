import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { Linking } from 'react-native';

interface ResourcesProps {
  onFaqPress?: () => void;
  onWebsitePress?: () => void;
}

function Resources({ 
  onFaqPress = () => Linking.openURL('https://lullabyai.net/'), 
  onWebsitePress = () => Linking.openURL('https://lullabyai.net/') 
}: ResourcesProps) {
  return (
    <View style={styles.resourcesContainer}>
      <TouchableOpacity 
        style={styles.resourceButton}
        onPress={onFaqPress}
      >
        <Ionicons name="information-circle-outline" size={18} color={colors.text} style={styles.resourceIcon} />
        <Text style={styles.resourceButtonText}>FAQ</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.resourceButton}
        onPress={onWebsitePress}
      >
        <Ionicons name="open-outline" size={18} color={colors.text} style={styles.resourceIcon} />
        <Text style={styles.resourceButtonText}>Visit Website</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  resourcesContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
  },
  resourceButtonText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  resourceIcon: {
    marginRight: theme.spacing.m,
  },
});

export default Resources; 