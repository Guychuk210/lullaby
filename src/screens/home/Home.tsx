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
import { getUserDevices } from '../../services/sensor';
import { SensorDevice } from '../../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userDevices = await getUserDevices(user.id);
        setDevices(userDevices);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  const handleAddDevice = () => {
    navigation.navigate('SensorSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <View style={[
                    styles.statusIndicator, 
                    { backgroundColor: device.isConnected ? colors.success : colors.error }
                  ]} />
                  <Text style={styles.statusText}>
                    {device.isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                <View style={styles.deviceDetails}>
                  <Text style={styles.detailText}>Battery: {device.batteryLevel}%</Text>
                  <Text style={styles.detailText}>
                    Last Sync: {new Date(device.lastSyncTime).toLocaleTimeString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => navigation.navigate('Sensor')}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  deviceCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  deviceName: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: theme.spacing.m,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  deviceDetails: {
    marginBottom: theme.spacing.m,
  },
  detailText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  viewDetailsButton: {
    backgroundColor: colors.secondary,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
  },
});

export default HomeScreen; 