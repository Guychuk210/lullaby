import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  limit as firebaseLimit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { BedWettingEvent } from '../types';

const EVENTS_COLLECTION = 'bedWettingEvents';

/**
 * Create a new bed-wetting event
 * @param deviceId Device ID that detected the event
 * @param timestamp Timestamp when the event occurred
 * @param intensity Optional intensity level
 * @param notes Optional notes about the event
 */
export const createEvent = async (
  deviceId: string, 
  timestamp: number = Date.now(),
  intensity?: 'low' | 'medium' | 'high',
  notes?: string
): Promise<BedWettingEvent> => {
  try {
    if (!deviceId) throw new Error('Device ID is required to create an event');
    if (!auth.currentUser) throw new Error('User must be authenticated to create an event');
    
    const eventData = {
      deviceId,
      timestamp,
      intensity: intensity || 'medium',
      notes: notes || '',
      isResolved: false,
      alertSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add event to the device's events subcollection
    const docRef = await addDoc(
      collection(db, 'users', auth.currentUser.uid, 'devices', deviceId, 'events'),
      eventData
    );
    
    // Return event data with proper conversion for local use
    return {
      id: docRef.id,
      ...eventData,
      createdAt: timestamp,
      updatedAt: timestamp
    } as BedWettingEvent;
  } catch (error) {
    console.error('Error creating bed-wetting event:', error);
    throw error;
  }
};

/**
 * Get events for a specific device
 * @param deviceId Device ID to get events for
 * @param limit Maximum number of events to return
 */
export const getDeviceEvents = async (deviceId: string, limit = 100): Promise<BedWettingEvent[]> => {
  try {
    if (!auth.currentUser) throw new Error('User must be authenticated to get events');
    
    const collectionPath = `users/${auth.currentUser.uid}/devices/${deviceId}/events`;
    console.log(`Querying events collection: ${collectionPath}`);
    
    const eventsQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'devices', deviceId, 'events'),
      orderBy('timestamp', 'desc'),
      firebaseLimit(limit)
    );
    
    const querySnapshot = await getDocs(eventsQuery);
    console.log(`Query returned ${querySnapshot.size} documents for device ${deviceId}`);
    
    const events: BedWettingEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Processing event document: ${doc.id}`, data);
      
      // Ensure timestamp is a valid number
      let timestamp = data.timestamp;
      if (timestamp === undefined || timestamp === null) {
        console.warn(`Event ${doc.id} has no timestamp, using current time`);
        timestamp = Date.now();
      } else if (typeof timestamp === 'string') {
        // Try to parse string timestamp as a number
        timestamp = parseInt(timestamp, 10);
        if (isNaN(timestamp)) {
          console.warn(`Event ${doc.id} has invalid string timestamp, using current time:`, data.timestamp);
          timestamp = Date.now();
        }
      } else if (timestamp instanceof Timestamp) {
        timestamp = timestamp.toMillis();
      } else if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        console.warn(`Event ${doc.id} has invalid timestamp, using current time:`, data.timestamp);
        timestamp = Date.now();
      }
      
      // Check if timestamp is in seconds instead of milliseconds (common Firebase error)
      if (timestamp < 1000000000000) {
        console.log(`Event ${doc.id} has timestamp in seconds, converting to milliseconds:`, timestamp);
        timestamp = timestamp * 1000;
      }
      
      // Handle createdAt and updatedAt
      let createdAt = Date.now();
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toMillis();
      } else if (typeof data.createdAt === 'number' && !isNaN(data.createdAt)) {
        createdAt = data.createdAt;
      }
      
      let updatedAt = createdAt;
      if (data.updatedAt instanceof Timestamp) {
        updatedAt = data.updatedAt.toMillis();
      } else if (typeof data.updatedAt === 'number' && !isNaN(data.updatedAt)) {
        updatedAt = data.updatedAt;
      }
      
      events.push({
        id: doc.id,
        ...data,
        deviceId: data.deviceId || deviceId, // Ensure deviceId is set
        timestamp,
        createdAt,
        updatedAt
      } as BedWettingEvent);
    });
    
    return events;
  } catch (error) {
    console.error(`Error getting events for device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Get a single event by ID
 * @param eventId Event ID to retrieve
 */
export const getEventById = async (eventId: string): Promise<BedWettingEvent | null> => {
  try {
    if (!auth.currentUser) throw new Error('User must be authenticated to get event');
    
    // First, we need to find which device this event belongs to
    // This is a limitation of our current structure
    // In a production environment, we might want to store a mapping of event IDs to device IDs
    throw new Error('getEventById is not supported in the current structure');
  } catch (error) {
    console.error('Error getting event by ID:', error);
    throw error;
  }
};

/**
 * Update an existing event
 * @param eventId Event ID to update
 * @param updates Object with properties to update
 */
export const updateEvent = async (
  eventId: string, 
  updates: Partial<BedWettingEvent>
): Promise<void> => {
  try {
    if (!auth.currentUser) throw new Error('User must be authenticated to update event');
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Remove id field if present in updates
    if ('id' in updateData) delete updateData.id;
    
    // First, we need to find which device this event belongs to
    // This is a limitation of our current structure
    throw new Error('updateEvent is not supported in the current structure');
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Mark an event as resolved
 * @param eventId Event ID to mark as resolved
 * @param deviceId Device ID that owns the event
 */
export const resolveEvent = async (eventId: string, deviceId: string): Promise<void> => {
  try {
    if (!auth.currentUser) throw new Error('User must be authenticated to resolve event');
    
    const eventRef = doc(db, 'users', auth.currentUser.uid, 'devices', deviceId, 'events', eventId);
    await updateDoc(eventRef, {
      isResolved: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error resolving event:', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param eventId Event ID to delete
 * @param deviceId Device ID that owns the event
 */
export const deleteEvent = async (eventId: string, deviceId: string): Promise<void> => {
  try {
    if (!auth.currentUser) throw new Error('User must be authenticated to delete event');
    
    const eventRef = doc(db, 'users', auth.currentUser.uid, 'devices', deviceId, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time event updates for a device
 * @param deviceId Device ID to subscribe to events for
 * @param callback Function to call with updated events
 */
export const subscribeToDeviceEvents = (
  deviceId: string, 
  callback: (events: BedWettingEvent[]) => void
) => {
  if (!auth.currentUser) throw new Error('User must be authenticated to subscribe to events');
  
  const collectionPath = `users/${auth.currentUser.uid}/devices/${deviceId}/events`;
  console.log(`Setting up real-time subscription for: ${collectionPath}`);
  
  const eventsQuery = query(
    collection(db, 'users', auth.currentUser.uid, 'devices', deviceId, 'events'),
    orderBy('timestamp', 'desc'),
    firebaseLimit(50)
  );
  
  return onSnapshot(eventsQuery, (snapshot) => {
    console.log(`Real-time update for device ${deviceId}: ${snapshot.size} documents, ${snapshot.docChanges().length} changes`);
    
    // Log the types of changes
    const changeTypes = snapshot.docChanges().map(change => change.type);
    console.log(`Change types:`, changeTypes);
    
    const events: BedWettingEvent[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Ensure timestamp is a valid number
      let timestamp = data.timestamp;
      if (timestamp === undefined || timestamp === null) {
        console.warn(`Event ${doc.id} has no timestamp, using current time`);
        timestamp = Date.now();
      } else if (typeof timestamp === 'string') {
        // Try to parse string timestamp as a number
        timestamp = parseInt(timestamp, 10);
        if (isNaN(timestamp)) {
          console.warn(`Event ${doc.id} has invalid string timestamp, using current time:`, data.timestamp);
          timestamp = Date.now();
        }
      } else if (timestamp instanceof Timestamp) {
        timestamp = timestamp.toMillis();
      } else if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        console.warn(`Event ${doc.id} has invalid timestamp, using current time:`, data.timestamp);
        timestamp = Date.now();
      }
      
      // Check if timestamp is in seconds instead of milliseconds (common Firebase error)
      if (timestamp < 1000000000000) {
        console.log(`Event ${doc.id} has timestamp in seconds, converting to milliseconds:`, timestamp);
        timestamp = timestamp * 1000;
      }
      
      // Handle createdAt and updatedAt
      let createdAt = Date.now();
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toMillis();
      } else if (typeof data.createdAt === 'number' && !isNaN(data.createdAt)) {
        createdAt = data.createdAt;
      }
      
      let updatedAt = createdAt;
      if (data.updatedAt instanceof Timestamp) {
        updatedAt = data.updatedAt.toMillis();
      } else if (typeof data.updatedAt === 'number' && !isNaN(data.updatedAt)) {
        updatedAt = data.updatedAt;
      }
      
      events.push({
        id: doc.id,
        ...data,
        deviceId: data.deviceId || deviceId, // Ensure deviceId is set
        timestamp,
        createdAt,
        updatedAt
      } as BedWettingEvent);
    });
    
    callback(events);
  }, (error) => {
    console.error(`Error in real-time subscription for device ${deviceId}:`, error);
  });
};

/**
 * Create an event from sensor data
 * This function will be used when receiving data from the sensor API
 * @param deviceId Device ID that detected the event
 * @param sensorData Optional additional sensor data
 */
export const createEventFromSensor = async (
  deviceId: string,
  sensorData?: {
    timestamp?: number;
    intensity?: 'low' | 'medium' | 'high';
    batteryLevel?: number;
  }
): Promise<BedWettingEvent> => {
  const timestamp = sensorData?.timestamp || Date.now();
  const intensity = sensorData?.intensity || 'medium';
  
  // Log sensor data for debugging
  console.log('Creating event from sensor data:', { deviceId, sensorData });
  
  // Create the event
  const event = await createEvent(deviceId, timestamp, intensity);
  
  // Optionally update device battery level if provided
  if (sensorData?.batteryLevel !== undefined) {
    try {
      // Import and use the existing updateDeviceStatus function
      const { updateDeviceStatus } = require('./sensor');
      await updateDeviceStatus(deviceId, true, sensorData.batteryLevel);
    } catch (error) {
      console.error('Error updating device battery level:', error);
      // Don't throw the error here to prevent event creation failure
    }
  }
  
  return event;
}; 