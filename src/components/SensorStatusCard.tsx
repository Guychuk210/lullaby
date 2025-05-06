import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { SensorDevice } from '../types';

interface SensorStatusCardProps {
  device: SensorDevice;
}

function SensorStatusCard({ device }: SensorStatusCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <Text style={styles.title}>{device.name}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Ionicons 
            name="shield" 
            size={16} 
            color={device.isConnected ? colors.success : colors.error} 
            style={styles.statusIcon}
          />
          <Text style={[
            styles.statusText,
            { color: device.isConnected ? colors.success : colors.error }
          ]}>
            {device.isConnected ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.m,
    borderColor: colors.border,
    borderWidth: 1,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[500],
    marginRight: theme.spacing.xs,
  },
  statusIcon: {
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
  },
});

export default SensorStatusCard; 