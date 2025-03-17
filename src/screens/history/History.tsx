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

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user } = useAuth();
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userDevices = await getUserDevices(user.id);
        setDevices(userDevices);
        
        if (userDevices.length > 0) {
          setSelectedDeviceId(userDevices[0].id);
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

  useEffect(() => {
    const fetchSensorData = async () => {
      if (!selectedDeviceId) return;
      
      try {
        setIsLoading(true);
        const data = await getSensorDataHistory(selectedDeviceId);
        setSensorData(data);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError('Failed to load sensor data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSensorData();
  }, [selectedDeviceId]);

  // Group data by date
  const groupedData = sensorData.reduce((groups, data) => {
    const date = new Date(data.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(data);
    return groups;
  }, {} as Record<string, SensorData[]>);

  return (
    <SafeAreaView style={styles.container}>
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
        ) : devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices found.</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('SensorSetup')}
            >
              <Text style={styles.buttonText}>Set Up Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {devices.length > 1 && (
              <View style={styles.deviceSelector}>
                <Text style={styles.selectorLabel}>Select Device:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.deviceButtonsContainer}
                >
                  {devices.map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        styles.deviceButton,
                        selectedDeviceId === device.id && styles.deviceButtonSelected
                      ]}
                      onPress={() => setSelectedDeviceId(device.id)}
                    >
                      <Text style={[
                        styles.deviceButtonText,
                        selectedDeviceId === device.id && styles.deviceButtonTextSelected
                      ]}>
                        {device.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {Object.keys(groupedData).length === 0 ? (
              <View style={styles.emptyDataContainer}>
                <Text style={styles.emptyDataText}>No history data available.</Text>
              </View>
            ) : (
              Object.entries(groupedData)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, dataItems]) => (
                  <View key={date} style={styles.dateGroup}>
                    <Text style={styles.dateHeader}>{date}</Text>
                    {dataItems.map((data) => (
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
    paddingVertical: theme.spacing.xs,
  },
  deviceButton: {
    backgroundColor: colors.white,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  deviceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deviceButtonText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.s,
    fontWeight: '500',
  },
  deviceButtonTextSelected: {
    color: colors.white,
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
  dateGroup: {
    marginBottom: theme.spacing.l,
  },
  dateHeader: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  dataCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataTime: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '500',
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
});

export default HistoryScreen; 