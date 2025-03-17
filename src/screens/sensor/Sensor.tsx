import React, { useState, useEffect } from 'react';
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

type SensorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SensorScreen() {
  const navigation = useNavigation<SensorScreenNavigationProp>();
  const { user } = useAuth();
  const [device, setDevice] = useState<SensorDevice | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceAndData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // For now, just get the first device
        const userDevices = await getUserDevices(user.id);
        if (userDevices.length > 0) {
          const selectedDevice = userDevices[0];
          setDevice(selectedDevice);
          
          // Get sensor data for this device
          const data = await getSensorDataHistory(selectedDevice.id);
          setSensorData(data);
        } else {
          setError('No devices found');
        }
      } catch (err) {
        console.error('Error fetching device data:', err);
        setError('Failed to load device data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceAndData();
  }, [user]);

  const handleSetupDevice = () => {
    navigation.navigate('SensorSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Status</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading sensor data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {error === 'No devices found' && (
              <TouchableOpacity style={styles.button} onPress={handleSetupDevice}>
                <Text style={styles.buttonText}>Set Up Device</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : device ? (
          <>
            <View style={styles.deviceInfoCard}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: device.isConnected ? colors.success : colors.error }
                ]} />
                <Text style={styles.statusText}>
                  {device.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Battery: {device.batteryLevel}%</Text>
                <Text style={styles.detailText}>
                  Last Sync: {new Date(device.lastSyncTime).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            {sensorData.length === 0 ? (
              <View style={styles.emptyDataContainer}>
                <Text style={styles.emptyDataText}>No sensor data recorded yet.</Text>
              </View>
            ) : (
              sensorData.map((data) => (
                <View key={data.id} style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <Text style={styles.dataTime}>
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </Text>
                    <View style={[
                      styles.dataStatusIndicator, 
                      { backgroundColor: data.isWet ? colors.error : colors.success }
                    ]} />
                    <Text style={styles.dataStatus}>
                      {data.isWet ? 'Wet Detected' : 'Dry'}
                    </Text>
                  </View>
                  <Text style={styles.dataDate}>
                    {new Date(data.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sensor connected.</Text>
            <TouchableOpacity style={styles.button} onPress={handleSetupDevice}>
              <Text style={styles.buttonText}>Set Up Device</Text>
            </TouchableOpacity>
          </View>
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
  deviceInfoCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.s,
  },
  statusText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  emptyDataContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDataText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
    textAlign: 'center',
  },
  dataCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  dataTime: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: theme.spacing.m,
  },
  dataStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  dataStatus: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  dataDate: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.gray[500],
  },
});

export default SensorScreen; 