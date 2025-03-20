import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';
import { BedWettingEvent } from '../../types';
import { format } from 'date-fns';

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user } = useAuth();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const { events, isLoading, error, resolveEvent, deleteEvent } = useEvents();

  // Get unique device IDs from events
  const deviceIds = Array.from(new Set(events.map(event => event.deviceId)));

  // Filter events by selected device
  const filteredEvents = selectedDeviceId 
    ? events.filter(event => event.deviceId === selectedDeviceId)
    : events;

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = format(event.timestamp, 'MMM dd, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, BedWettingEvent[]>);

  const handleResolveEvent = async (eventId: string) => {
    try {
      await resolveEvent(eventId);
    } catch (err) {
      Alert.alert('Error', 'Failed to resolve event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(eventId);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : deviceIds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found.</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('SensorSetup')}
            >
              <Text style={styles.buttonText}>Set Up Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {deviceIds.length > 1 && (
              <View style={styles.deviceSelector}>
                <Text style={styles.selectorLabel}>Select Device:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.deviceButtonsContainer}
                >
                  {deviceIds.map((deviceId) => (
                    <TouchableOpacity
                      key={deviceId}
                      style={[
                        styles.deviceButton,
                        selectedDeviceId === deviceId && styles.deviceButtonSelected
                      ]}
                      onPress={() => setSelectedDeviceId(deviceId)}
                    >
                      <Text style={[
                        styles.deviceButtonText,
                        selectedDeviceId === deviceId && styles.deviceButtonTextSelected
                      ]}>
                        Device {deviceId.slice(0, 6)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {Object.keys(groupedEvents).length === 0 ? (
              <View style={styles.emptyDataContainer}>
                <Text style={styles.emptyDataText}>No events found.</Text>
              </View>
            ) : (
              Object.entries(groupedEvents)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, events]) => (
                  <View key={date} style={styles.dateGroup}>
                    <Text style={styles.dateHeader}>{date}</Text>
                    {events.map((event) => (
                      <View key={event.id} style={styles.eventCard}>
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventTime}>
                            {format(event.timestamp, 'hh:mm a')}
                          </Text>
                          <View style={[
                            styles.eventStatusIndicator, 
                            { backgroundColor: event.isResolved ? colors.success : colors.warning }
                          ]} />
                          <Text style={styles.eventStatus}>
                            {event.isResolved ? 'Resolved' : 'Pending'}
                          </Text>
                        </View>
                        <View style={styles.eventActions}>
                          {!event.isResolved && (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.resolveButton]}
                              onPress={() => handleResolveEvent(event.id)}
                            >
                              <Text style={styles.actionButtonText}>Resolve</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteEvent(event.id)}
                          >
                            <Text style={styles.actionButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: theme.spacing.l,
    paddingTop: theme.padding.header,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.error,
    marginBottom: theme.spacing.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
    marginBottom: theme.spacing.l,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  buttonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  deviceSelector: {
    marginBottom: theme.spacing.l,
  },
  selectorLabel: {
    fontSize: theme.typography.fontSize.s,
    fontWeight: '500',
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  deviceButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
  deviceButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    backgroundColor: colors.gray[100],
  },
  deviceButtonSelected: {
    backgroundColor: colors.primary,
  },
  deviceButtonText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  deviceButtonTextSelected: {
    color: colors.white,
  },
  dateGroup: {
    marginBottom: theme.spacing.l,
  },
  dateHeader: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  eventStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: theme.spacing.s,
  },
  eventStatus: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.s,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
  },
  resolveButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.s,
    fontWeight: '500',
  },
  emptyDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyDataText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
});

export default HistoryScreen; 