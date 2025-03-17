import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { SensorData, SensorDevice } from '../types';

// Register a new sensor device
export const registerSensorDevice = async (userId: string, deviceName: string): Promise<SensorDevice> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to register a device');
    }
    
    const deviceData = {
      name: deviceName,
      userId,
      isConnected: false,
      batteryLevel: 100,
      lastSyncTime: Date.now(),
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'devices'), deviceData);
    
    // Return device data with proper type conversion
    return {
      id: docRef.id,
      ...deviceData,
      createdAt: Date.now(), // Use current timestamp for local object
    } as SensorDevice;
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
};

// Get user's sensor devices
export const getUserDevices = async (userId: string): Promise<SensorDevice[]> => {
  try {
    const devicesQuery = query(
      collection(db, 'devices'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(devicesQuery);
    const devices: SensorDevice[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      devices.push({
        id: doc.id,
        ...data,
        // Convert any Firebase timestamps to regular timestamps
        lastSyncTime: data.lastSyncTime || Date.now(),
        createdAt: data.createdAt ? Date.now() : Date.now(),
      } as SensorDevice);
    });
    
    return devices;
  } catch (error) {
    console.error('Error getting user devices:', error);
    throw error;
  }
};

// Update sensor device status
export const updateDeviceStatus = async (deviceId: string, isConnected: boolean, batteryLevel: number): Promise<void> => {
  try {
    await updateDoc(doc(db, 'devices', deviceId), {
      isConnected,
      batteryLevel,
      lastSyncTime: Date.now(),
    });
  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
};

// Record sensor data
export const recordSensorData = async (deviceId: string, isWet: boolean): Promise<void> => {
  try {
    await addDoc(collection(db, 'sensorData'), {
      deviceId,
      isWet,
      timestamp: Date.now(),
      recordedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording sensor data:', error);
    throw error;
  }
};

// Get sensor data history
export const getSensorDataHistory = async (deviceId: string, limit = 100): Promise<SensorData[]> => {
  try {
    const dataQuery = query(
      collection(db, 'sensorData'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      // limit(limit)
    );
    
    const querySnapshot = await getDocs(dataQuery);
    const dataHistory: SensorData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dataHistory.push({
        id: doc.id,
        ...data,
        // Convert any Firebase timestamps to regular timestamps
        timestamp: data.timestamp || Date.now(),
        recordedAt: data.recordedAt ? Date.now() : Date.now(),
      } as SensorData);
    });
    
    return dataHistory;
  } catch (error) {
    console.error('Error getting sensor data history:', error);
    throw error;
  }
};

// Subscribe to real-time sensor data updates
export const subscribeSensorData = (deviceId: string, callback: (data: SensorData[]) => void) => {
  const dataQuery = query(
    collection(db, 'sensorData'),
    where('deviceId', '==', deviceId),
    orderBy('timestamp', 'desc'),
    // limit(10)
  );
  
  return onSnapshot(dataQuery, (snapshot) => {
    const dataHistory: SensorData[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      dataHistory.push({
        id: doc.id,
        ...data,
        // Convert any Firebase timestamps to regular timestamps
        timestamp: data.timestamp || Date.now(),
        recordedAt: data.recordedAt ? Date.now() : Date.now(),
      } as SensorData);
    });
    
    callback(dataHistory);
  });
};
