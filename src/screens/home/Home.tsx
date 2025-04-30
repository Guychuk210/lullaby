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
import GuidanceVideos from '../../components/GuidanceVideos';
import { createEvent, getDeviceEvents } from '../../services/events';
import { auth } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { Audio } from 'expo-av';
import axios from 'axios';
import { config } from '../../constants/config';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Enum for tab selection
enum TabView {
  DASHBOARD = 'Dashboard',
  GUIDANCE = 'Guidance Videos'
}

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Function to play the ringtone
  const playRingtone = async () => {
    try {
      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load and play the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/ringtone.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing ringtone:', error);
      Alert.alert('Error', 'Failed to play ringtone');
    }
  };

  // Function to stop the ringtone
  const stopRingtone = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.error('Error stopping ringtone:', error);
      Alert.alert('Error', 'Failed to stop ringtone');
    }
  };

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create events.');
        return;
      }
      
      const deviceId = devices[0].id;
      
      // Call the server's reportEvent endpoint directly
      const serverUrl = config.apiUrl + '/sensors'; // Server route from routes/index.ts and sensor.routes.ts
      
      // Prepare event data for the sensor controller
      const eventData = {
        isWet: true,
        intensity: 'medium',
        batteryLevel: 85,
        signalStrength: 70,
        timestamp: Date.now()
      };
      
      console.log(`Sending test event to server for device ${deviceId}...`);
      
      try {
        // Call the server's reportEvent endpoint
        // Route is defined in sensor.routes.ts as /:id/events
        const response = await axios.post(
          `${serverUrl}/${deviceId}/events`, 
          eventData
        );
        
        console.log('Server response:', response.data);
        
        if (response.data.success) {
          Alert.alert(
            'Success', 
            `Test event created!`
          );
          
          // Refresh the events list
          const refreshedEvents = await getDeviceEvents(deviceId);
          setEvents(prevEvents => {
            const otherDeviceEvents = prevEvents.filter(e => e.deviceId !== deviceId);
            return [...refreshedEvents, ...otherDeviceEvents].sort((a, b) => b.timestamp - a.timestamp);
          });
        } else {
          throw new Error(response.data.error || 'Unknown server error');
        }
      } catch (serverError) {
        console.error('Server request failed:', serverError);
        
        // Fallback to local event creation if server call fails
        Alert.alert(
          'Server Communication Failed',
          'Creating local event record only. The server call failed with error: ' + 
          (serverError instanceof Error ? serverError.message : 'Unknown error'),
          [
            { 
              text: 'Cancel', 
              style: 'cancel' 
            },
            {
              text: 'Create Local Event Only',
              onPress: async () => {
                const event = await createEvent(
                  deviceId, 
                  Date.now(), 
                  'medium', 
                  'Test event created locally (server unreachable)'
                );
                
                setEvents(prevEvents => [event, ...prevEvents].sort((a, b) => b.timestamp - a.timestamp));
                
                Alert.alert('Success', `Local event created with ID: ${event.id}`);
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error creating test event:', err);
      Alert.alert('Error', `Failed to create test event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const renderDashboardContent = () => (
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
          onPress={() => {
            if (sound) {
              stopRingtone();
            } else {
              playRingtone();
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {sound ? 'Stop Alarm' : 'Alarm!'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Your Devices</Text>
      {devices.map((device) => (
        <SensorStatusCard key={device.id} device={device} />
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
              <Text style={styles.clearDateButtonText}>Hide</Text>
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
                  <Text style={styles.eventTime}> An event occured at:&nbsp;
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      )}
      
      <Text style={styles.sectionTitle}>Resources</Text>
      <Resources />
      
      <TouchableOpacity style={styles.addDeviceButton} onPress={handleAddDevice}>
        <Text style={styles.addDeviceButtonText}>Add Another Device</Text>
      </TouchableOpacity>
    </>
  );

  const guidanceVideos = [
    {
      id: '1',
      title: 'Welcome to Lullaby.AI!',
      duration: '3:45',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=m7Igg3jgXBU'),
    },
    {
      id: '2',
      title: 'What is Bedwetting?',
      duration: '3:21',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=ifEvP-rbn1Y'),
    },
    {
      id: '3',
      title: 'Bedwetting & ADHD: What You Should Know',
      duration: '7:15',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=y_T5K-3vBgY'),
    },
    {
      id: '4',
      title: 'How to Use the App',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=m7Igg3jgXBU'),
    },
    {
      id: '5',
      title: "Why It's Important for Your Child to Hear the Alarm",
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=8Vzn3rChuRM'),
    },
    {
      id: '6',
      title: 'Troubleshooting: Sensor Issues',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=m7Igg3jgXBU'),
    },
    {
      id: '7',
      title: 'Tips That You Should Know',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=qkNxeST4V2U'),
    },
    {
      id: '8',
      title: 'Exercises & Evening Habits for Dry Nights',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=QwmE7FABetU'),
    },
    {
      id: '9',
      title: 'Positive Reinforcement & Building Control',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=-AyB6pWtnwU'),
    },
    {
      id: '10',
      title: 'What is a success?',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=y_T5K-3vBgY'),
    },
    {
      id: '11',
      title: 'How to Talk to Your Child About Bedwetting (and Their Siblings Too)',
      duration: '4:30',
      onPress: () => Linking.openURL('https://youtube.com/watch?v=m7Igg3jgXBU'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header notificationCount={3} />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === TabView.DASHBOARD && styles.activeTabButton
          ]}
          onPress={() => setActiveTab(TabView.DASHBOARD)}
        >
          <Text 
            style={[
              styles.tabButtonText, 
              activeTab === TabView.DASHBOARD && styles.activeTabButtonText
            ]}
          >
            {TabView.DASHBOARD}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === TabView.GUIDANCE && styles.activeTabButton
          ]}
          onPress={() => setActiveTab(TabView.GUIDANCE)}
        >
          <Text 
            style={[
              styles.tabButtonText, 
              activeTab === TabView.GUIDANCE && styles.activeTabButtonText
            ]}
          >
            {TabView.GUIDANCE}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
      >
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
        ) : devices.length === 0 && activeTab === TabView.DASHBOARD ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any devices yet.</Text>
            <TouchableOpacity style={styles.addDeviceButton} onPress={handleAddDevice}>
              <Text style={styles.addDeviceButtonText}>Add a Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeTab === TabView.DASHBOARD ? (
            renderDashboardContent()
          ) : (
            <GuidanceVideos videos={guidanceVideos} />
          )
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
  alarmButtonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  createAlarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
    borderRadius: 50,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.xl,
  },
  alarmIcon: {
    marginRight: theme.spacing.s,
  },
  createAlarmText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.xl,
    marginVertical: theme.spacing.m,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.gray[500],
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxl,
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