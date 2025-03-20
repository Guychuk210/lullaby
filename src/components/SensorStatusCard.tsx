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
  // Calculate signal strength based on some logic (placeholder)
  const getSignalStrength = (): { text: string; level: number } => {
    // This would be based on actual signal data in a real app
    // For now, just return a placeholder value
    return { text: 'Excellent', level: 4 };
  };

  const signalInfo = getSignalStrength();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{device.name}</Text>
      
      <View style={styles.statusGrid}>
        {/* Signal Strength */}
        <View style={styles.statusItem}>
          <View style={styles.signalIcon}>
            {[1, 2, 3, 4].map((bar) => (
              <View 
                key={`signal-${bar}`}
                style={[
                  styles.signalBar, 
                  { 
                    height: 4 + (bar * 3),
                    backgroundColor: bar <= signalInfo.level ? colors.primary : colors.gray[300]
                  }
                ]} 
              />
            ))}
          </View>
          <Text style={styles.statusLabel}>Signal</Text>
          <Text style={styles.statusValue}>{signalInfo.text}</Text>
        </View>
        
        {/* Battery Level */}
        <View style={styles.statusItem}>
          <View style={styles.batteryIcon}>
            <Ionicons 
              name="battery-half" 
              size={24} 
              color={device.batteryLevel > 20 ? colors.primary : colors.error} 
            />
          </View>
          <Text style={styles.statusLabel}>Battery</Text>
          <Text style={styles.statusValue}>{device.batteryLevel}%</Text>
        </View>
        
        {/* Status */}
        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <Ionicons 
              name="shield" 
              size={24} 
              color={device.isConnected ? colors.success : colors.error} 
            />
          </View>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>{device.isConnected ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  signalIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    marginBottom: theme.spacing.s,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  batteryIcon: {
    height: 24,
    justifyContent: 'center',
    marginBottom: theme.spacing.s,
  },
  statusIcon: {
    height: 24,
    justifyContent: 'center',
    marginBottom: theme.spacing.s,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[500],
    marginBottom: theme.spacing.xs,
  },
  statusValue: {
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
    color: colors.text,
  },
});

export default SensorStatusCard; 