import { createEventFromSensor, getEventById } from './events';
import { auth } from './firebase';

/**
 * API service module for handling external API requests
 * This will serve as a bridge between external sensors and the app
 */

// API key validation (this is a simple implementation, in production you'd use a more secure method)
const API_KEYS: Record<string, string> = {
  // Format: API_KEY: userId
  'test-api-key-1': 'test-user-id-1', // For testing purposes
};

/**
 * Validate API key and return associated user ID
 * @param apiKey API key to validate
 * @returns User ID associated with the API key or null if invalid
 */
export const validateApiKey = (apiKey: string): string | null => {
  return API_KEYS[apiKey] || null;
};

/**
 * Create an event from sensor API data
 * @param apiKey API key for authentication
 * @param deviceId Device ID that detected the event
 * @param data Sensor data
 */
export const handleSensorEventApi = async (
  apiKey: string,
  deviceId: string,
  data: {
    timestamp?: number;
    isWet: boolean;
    intensity?: 'low' | 'medium' | 'high';
    batteryLevel?: number;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  try {
    // Validate API key
    const userId = validateApiKey(apiKey);
    if (!userId) {
      return { success: false, error: 'Invalid API key' };
    }

    // Only create event if isWet is true
    if (!data.isWet) {
      return { success: true };
    }

    // Create event
    const event = await createEventFromSensor(deviceId, {
      timestamp: data.timestamp,
      intensity: data.intensity,
      batteryLevel: data.batteryLevel,
    });

    return { success: true, eventId: event.id };
  } catch (error) {
    console.error('Error handling sensor event API:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Register a new API key for a user
 * This should be called from a secure admin context
 * @param userId User ID to register API key for
 * @returns Generated API key
 */
export const registerApiKey = (userId: string): string => {
  // In a real app, generate a secure random key
  const apiKey = `api-key-${userId}-${Date.now()}`;
  
  // Store the key
  API_KEYS[apiKey] = userId;
  
  return apiKey;
};

/**
 * Get events for the current authenticated user
 * This is for use within the app, not external API
 */
export const getCurrentUserEvents = async (limit = 100) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  // Implementation needs to be updated since getUserEvents is not available
  throw new Error('getCurrentUserEvents function needs implementation');
};

/**
 * Simulates a sensor event for testing
 * This is for development/testing only
 */
export const simulateSensorEvent = async (
  deviceId: string,
  isWet: boolean = true,
  intensity: 'low' | 'medium' | 'high' = 'medium'
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  if (!isWet) {
    return { success: true };
  }
  
  const event = await createEventFromSensor(deviceId, {
    timestamp: Date.now(),
    intensity,
    batteryLevel: Math.floor(Math.random() * 100), // Random battery level for testing
  });
  
  return { success: true, eventId: event.id };
}; 