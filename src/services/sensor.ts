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
import { auth } from './firebase';

// Register a new sensor device
export const registerSensorDevice = async (userId: string, deviceName: string): Promise<SensorDevice> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to register a device');
    }
    
    const deviceData = {
      name: deviceName,
      isConnected: false,
      batteryLevel: 100,
      lastSyncTime: Date.now(),
      createdAt: serverTimestamp(),
    };
    
    // Add device to the user's devices subcollection
    const docRef = await addDoc(collection(db, 'users', userId, 'devices'), deviceData);
    
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
    // Query the devices subcollection under the user document
    const devicesQuery = query(
      collection(db, 'users', userId, 'devices')
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
    // Get the user ID from the current user
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Update device in the user's devices subcollection
    await updateDoc(doc(db, 'users', userId, 'devices', deviceId), {
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
    // Get the user ID from the current user
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Add sensor data to the device's sensorData subcollection
    await addDoc(collection(db, 'users', userId, 'devices', deviceId, 'sensorData'), {
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
    // Get the user ID from the current user
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const dataQuery = query(
      collection(db, 'users', userId, 'devices', deviceId, 'sensorData'),
      orderBy('timestamp', 'desc'),
      // limit(limit)
    );
    
    const querySnapshot = await getDocs(dataQuery);
    const dataHistory: SensorData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dataHistory.push({
        id: doc.id,
        deviceId,
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
  // Get the user ID from the current user
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const dataQuery = query(
    collection(db, 'users', userId, 'devices', deviceId, 'sensorData'),
    orderBy('timestamp', 'desc'),
    // limit(10)
  );
  
  return onSnapshot(dataQuery, (snapshot) => {
    const dataHistory: SensorData[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      dataHistory.push({
        id: doc.id,
        deviceId,
        ...data,
        // Convert any Firebase timestamps to regular timestamps
        timestamp: data.timestamp || Date.now(),
        recordedAt: data.recordedAt ? Date.now() : Date.now(),
      } as SensorData);
    });
    
    callback(dataHistory);
  });
};
