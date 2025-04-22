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
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { SensorData, SensorDevice } from '../types';
import { auth } from './firebase';

/**
 * Formats a date in YYMMDD-HHMMSS format
 * @param date - Date or timestamp to format (defaults to current time)
 * @returns Formatted timestamp string
 */
const formatTimestamp = (date: Date | number | string = new Date()): string => {
  let dateObj: Date;
  
  if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string' && !isNaN(Date.parse(date))) {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date();
  }
  
  const year = dateObj.getFullYear().toString().slice(-2);
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

// Register a new sensor device
export const registerSensorDevice = async (userId: string, deviceName: string, deviceId: string): Promise<SensorDevice> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to register a device');
    }
    
    const now = new Date();
    
    const deviceData = {
      name: deviceName,
      isConnected: false,
      batteryLevel: 100,
      lastSyncTime: now,
      createdAt: now,
    };
    
    // Use setDoc with the provided deviceId as the document ID
    const deviceRef = doc(db, 'users', userId, 'devices', deviceId);
    await setDoc(deviceRef, deviceData);
    
    // Return device data with proper type conversion
    return {
      id: deviceId,
      ...deviceData,
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
        // Make sure timestamps are in correct format
        lastSyncTime: data.lastSyncTime || formatTimestamp(),
        createdAt: data.createdAt || formatTimestamp(),
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
      lastSyncTime: formatTimestamp(),
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

    const timestamp = formatTimestamp();
    
    // Add sensor data to the device's sensorData subcollection
    await addDoc(collection(db, 'users', userId, 'devices', deviceId, 'sensorData'), {
      isWet,
      timestamp,
      recordedAt: timestamp,
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
        // Make sure timestamps are in correct format
        timestamp: data.timestamp || formatTimestamp(),
        recordedAt: data.recordedAt || formatTimestamp(),
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
        // Make sure timestamps are in correct format
        timestamp: data.timestamp || formatTimestamp(),
        recordedAt: data.recordedAt || formatTimestamp(),
      } as SensorData);
    });
    
    callback(dataHistory);
  });
};
