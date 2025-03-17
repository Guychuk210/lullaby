import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getUserDevices, getSensorDataHistory } from '../../services/sensor';
import { SensorDevice, SensorData } from '../../types';
import SensorStatusCard from '../../components/SensorStatusCard';
import EventCalendar from '../../components/EventCalendar';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<SensorData[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userDevices = await getUserDevices(user.id);
        setDevices(userDevices);
        
        // Fetch sensor data for the first device
        if (userDevices.length > 0) {
          const data = await getSensorDataHistory(userDevices[0].id);
          setSensorData(data);
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, [user]);
  
  // Filter events for the selected day
  useEffect(() => {
    if (!selectedDate || !sensorData.length) {
      setFilteredEvents([]);
      return;
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const filtered = sensorData.filter(data => {
      const eventDate = new Date(data.timestamp);
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });
    
    setFilteredEvents(filtered);
  }, [selectedDate, sensorData]);

  const handleAddDevice = () => {
    navigation.navigate('SensorSetup');
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.displayName || 'there'}!</Text>
        <Text style={styles.subtitle}>Welcome to Lullaby</Text>
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
            <Text style={styles.sectionTitle}>Your Devices</Text>
            {devices.map((device) => (
              <TouchableOpacity 
                key={device.id}
                onPress={() => navigation.navigate('Main', { screen: 'Sensor' })}
              >
                <SensorStatusCard device={device} />
              </TouchableOpacity>
            ))}
            
            <Text style={styles.sectionTitle}>Event Calendar</Text>
            <EventCalendar 
              sensorData={sensorData}
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
                          { backgroundColor: event.isWet ? colors.error : colors.success }
                        ]} />
                        <Text style={styles.eventStatus}>
                          {event.isWet ? 'Wet Detected' : 'Dry'}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
            
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
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
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
});

export default HomeScreen; 