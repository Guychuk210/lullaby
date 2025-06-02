import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { SensorDevice } from '../types';
import { useDeviceStatus } from '../hooks/useDeviceStatus';

interface SensorStatusCardProps {
  device: SensorDevice;
}

function SensorStatusCard({ device }: SensorStatusCardProps) {
  // Use the Firebase-based device status hook instead of the isConnected prop
  const { isActive, isLoading, error, lastSyncTime } = useDeviceStatus(device.id);
  
  // Add a refresh state to force re-render of time formatting every 30 seconds
  const [refreshKey, setRefreshKey] = useState(0);

  // Set up interval to refresh time formatting every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to format the last sync time for display
  const formatLastSyncTime = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    
    try {
      const syncDate = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - syncDate.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      // Show seconds for the first 60 seconds
      if (diffSeconds < 60) {
        if (diffSeconds < 10) {
          return 'Just now';
        } else {
          return `${diffSeconds}s ago`;
        }
      }
      // Show minutes for 1-59 minutes with more detail up to 10 minutes
      else if (diffMinutes < 60) {
        if (diffMinutes <= 10) {
          return `${diffMinutes}m ago`;
        } else if (diffMinutes < 30) {
          return `${diffMinutes}m ago`;
        } else {
          return `${diffMinutes}m ago`;
        }
      }
      // Show hours for longer periods
      else {
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          return `${diffHours}h ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          return `${diffDays}d ago`;
        }
      }
    } catch (err) {
      console.error('Error formatting sync time:', err);
      return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <Text style={styles.title}>{device.name}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          
          {/* Show loading indicator while checking Firebase status */}
          {isLoading ? (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.loadingIndicator}
            />
          ) : (
            <>
              <Ionicons 
                name="shield" 
                size={16} 
                color={isActive ? colors.success : colors.error} 
                style={styles.statusIcon}
              />
              <Text style={[
                styles.statusText,
                { color: isActive ? colors.success : colors.error }
              ]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </>
          )}
        </View>
      </View>
      
      {/* Display last sync time and any errors for debugging */}
      <View style={styles.syncInfoRow}>
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          <Text style={styles.syncTimeText}>
            Last life signal recieved: {formatLastSyncTime(lastSyncTime)}
          </Text>
        )}
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
  loadingIndicator: {
    marginLeft: theme.spacing.xs,
  },
  syncInfoRow: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  syncTimeText: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.gray[400],
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.error,
    fontStyle: 'italic',
  },
});

export default SensorStatusCard; 