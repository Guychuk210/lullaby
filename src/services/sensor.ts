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
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { SensorData, SensorDevice } from '../types';
import { auth } from './firebase';
import { config } from '../constants/config';

// Use the API URL from config
const API_URL = config.apiUrl;

/**
 * Formats a date as an ISO string
 * @param date - Date or timestamp to format (defaults to current time)
 * @returns ISO string timestamp
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
  
  return dateObj.toISOString();
};

// Register a new sensor device
export const registerSensorDevice = async (userId: string, deviceName: string, deviceId: string, phoneNumber: string): Promise<SensorDevice> => {
  console.log('registering device');
  try {
    if (!userId) {
      throw new Error('User ID is required to register a device');
    }
    
    const now = new Date();
    
    const deviceData = {
      name: deviceName,
      phoneNumber: phoneNumber,
      isConnected: false,
      batteryLevel: 100,
      createdAt: formatTimestamp(now),
    };
    
    // First, claim the device in AWS IoT before creating in Firestore
    console.log('claiming device from AWS IoT');
    await claimDevice(userId, deviceId, deviceName);
    console.log('device claimed successfully');
    
    // Only create device in Firestore if AWS IoT claim was successful
    const deviceRef = doc(db, 'users', userId, 'devices', deviceId);
    await setDoc(deviceRef, deviceData);
    
    console.log('device registered in Firestore');
    
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

/**
 * Claims a device in the AWS IoT system through our server endpoint
 * @param userId User ID who is claiming the device
 * @param deviceId Device ID to claim (MAC address)
 * @param deviceName Name of the device
 * @returns Promise that resolves when the device is claimed
 */
export const claimDevice = async (userId: string, deviceId: string, deviceName: string): Promise<void> => {
  try {
    console.log(`Claiming device ${deviceId} for user ${userId} with name ${deviceName}`);
    
    const response = await fetch(`${API_URL}/sensors/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        deviceId,
        deviceName
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error claiming device:', errorData);
      // Check for both 'message' and 'error' fields to handle different server response formats
      const errorMessage = errorData.message || errorData.error || 'Failed to claim device';
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Device claimed successfully:', result);
  } catch (error) {
    console.error('Error claiming device:', error);
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

// Update device phone number
export const updateDevicePhoneNumber = async (userId: string, deviceId: string, phoneNumber: string): Promise<void> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to update device phone number');
    }

    // Update device in the user's devices subcollection
    const deviceRef = doc(db, 'users', userId, 'devices', deviceId);
    await updateDoc(deviceRef, {
      phoneNumber: phoneNumber,
    });
    
    console.log('Device phone number updated successfully');
  } catch (error) {
    console.error('Error updating device phone number:', error);
    throw error;
  }
};

// Update device ID (document ID) by creating a new document and deleting the old one
export const updateDeviceId = async (userId: string, oldDeviceId: string, newDeviceId: string): Promise<void> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to update device ID');
    }

    // Get the old device document
    const oldDeviceRef = doc(db, 'users', userId, 'devices', oldDeviceId);
    const oldDeviceDoc = await getDoc(oldDeviceRef);
    
    if (!oldDeviceDoc.exists()) {
      throw new Error('Device not found');
    }
    
    // Get all data from the old device
    const deviceData = oldDeviceDoc.data();
    
    // Create a new device document with the new ID
    const newDeviceRef = doc(db, 'users', userId, 'devices', newDeviceId);
    await setDoc(newDeviceRef, {
      ...deviceData,
      // Update any fields that should reflect the ID change
      lastSyncTime: formatTimestamp(),
    });
    
    // Delete the old device document
    await deleteDoc(oldDeviceRef);
    
    console.log('Device ID updated successfully from', oldDeviceId, 'to', newDeviceId);
  } catch (error) {
    console.error('Error updating device ID:', error);
    throw error;
  }
};
