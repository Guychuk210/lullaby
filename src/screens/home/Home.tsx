import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getUserDevices } from '../../services/sensor';
import { SensorDevice } from '../../types';
import SensorStatusCard from '../../components/SensorStatusCard';
import EventCalendar from '../../components/EventCalendar';
import Resources from '../../components/Resources';
import WeeklyProgress from '../../components/WeeklyProgress';
import { createEvent, getDeviceEvents } from '../../services/events';
import { auth } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchDevicesAndEvents = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userDevices = await getUserDevices(user.id);
        setDevices(userDevices);
        
        // Fetch events for all devices
        const allEvents: any[] = [];
        for (const device of userDevices) {
          const deviceEvents = await getDeviceEvents(device.id);
          allEvents.push(...deviceEvents);
        }
        
        // Sort events by timestamp
        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        setEvents(allEvents);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevicesAndEvents();
  }, [user]);
  
  // Filter events for the selected day
  useEffect(() => {
    if (!selectedDate || !events.length) {
      setFilteredEvents([]);
      return;
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const filtered = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });
    
    setFilteredEvents(filtered);
  }, [selectedDate, events]);

  const handleAddDevice = () => {
    navigation.navigate('SensorSetup');
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

  const createTestEvent = async () => {
    try {
      if (devices.length === 0) {
        Alert.alert(
          'No Devices', 
          'You need to register a device first before creating events.'
        );
        return;
      }
      
      const deviceId = devices[0].id;
      const event = await createEvent(deviceId, Date.now(), 'medium', 'Test event created from Home screen');
      
      // Add the new event to the events list
      setEvents(prevEvents => [event, ...prevEvents].sort((a, b) => b.timestamp - a.timestamp));
      
      Alert.alert('Success', `Test event created with ID: ${event.id}`);
    } catch (err) {
      console.error('Error creating test event:', err);
      Alert.alert('Error', `Failed to create test event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.displayName || 'there'}!</Text>
        <Text style={styles.subtitle}>Welcome to Lullaby</Text>
        <TouchableOpacity 
          style={styles.notificationIcon} 
          onPress={() => navigation.navigate('Main', { screen: 'History' })}
        >
          <Ionicons name="notifications" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your devices...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setIsLoading(true);
                getUserDevices(user?.id || '').then(setDevices).catch(err => {
                  console.error('Error retrying device fetch:', err);
                  setError('Failed to load devices');
                }).finally(() => setIsLoading(false));
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any devices yet.</Text>
            <TouchableOpacity style={styles.addDeviceButton} onPress={handleAddDevice}>
              <Text style={styles.addDeviceButtonText}>Add a Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.testEventButton]} 
                onPress={createTestEvent}
              >
                <Text style={styles.actionButtonText}>Create Test Event</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.alarmButton]} 
                onPress={() => Alert.alert('Create Alarm', 'Alarm functionality will be added here')}
              >
                <Text style={styles.actionButtonText}>Create an Alarm</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Your Devices</Text>
            {devices.map((device) => (
              <TouchableOpacity 
                key={device.id}
                onPress={() => navigation.navigate('Main', { screen: 'History' })}
              >
                <SensorStatusCard device={device} />
              </TouchableOpacity>
            ))}
            
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <WeeklyProgress events={events} />
            
            <Text style={styles.sectionTitle}>Event Calendar</Text>
            <EventCalendar 
              events={events}
              onDayPress={handleDayPress}
            />
            
            {selectedDate && (
              <>
                <View style={styles.selectedDateHeader}>
                  <Text style={styles.selectedDateTitle}>
                    Events for {selectedDate.toLocaleDateString()}
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearDateButton}
                    onPress={() => setSelectedDate(null)}
                  >
                    <Text style={styles.clearDateButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                
                {filteredEvents.length === 0 ? (
                  <View style={styles.emptyEventsContainer}>
                    <Text style={styles.emptyEventsText}>No events on this day</Text>
                  </View>
                ) : (
                  filteredEvents.map((event) => (
                    <View key={event.id} style={styles.eventCard}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTime}>
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </Text>
                        <View style={[
                          styles.eventStatusIndicator, 
                          { backgroundColor: event.intensity === 'high' ? colors.error : 
                            event.intensity === 'medium' ? colors.warning : colors.success }
                        ]} />
                        <Text style={styles.eventStatus}>
                          {event.intensity.charAt(0).toUpperCase() + event.intensity.slice(1)} Intensity
                        </Text>
                      </View>
                      {event.notes && (
                        <Text style={styles.eventNotes}>{event.notes}</Text>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
            
            <Text style={styles.sectionTitle}>Resources</Text>
            <Resources 
              // onFaqPress={() => Alert.alert('FAQ', 'Opening FAQ...')}
              // onWebsitePress={() => Alert.alert('Website', 'Opening website...')}
            />
            
            <TouchableOpacity style={styles.addDeviceButton} onPress={handleAddDevice}>
              <Text style={styles.addDeviceButtonText}>Add Another Device</Text>
            </TouchableOpacity>
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
    position: 'relative',
  },
  greeting: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.m,
    color: colors.white,
    opacity: 0.8,
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
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
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
  addDeviceButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignSelf: 'center',
    marginTop: theme.spacing.l,
  },
  addDeviceButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.m,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
  },
  selectedDateTitle: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearDateButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
  },
  clearDateButtonText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
  },
  emptyEventsContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  emptyEventsText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.gray[500],
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  eventStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: theme.spacing.s,
  },
  eventStatus: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  eventNotes: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[600],
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.s,
    textAlign: 'center',
  },
  testEventButton: {
    backgroundColor: colors.secondary,
  },
  alarmButton: {
    backgroundColor: colors.primary,
  },
  notificationIcon: {
    position: 'absolute',
    right: theme.spacing.xl,
    top: theme.padding.header+5,
    padding: theme.spacing.s,
  },
});

export default HomeScreen; 