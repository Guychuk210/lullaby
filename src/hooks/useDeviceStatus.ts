import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';

interface DeviceStatusHook {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

/**
 * Hook to monitor device sync status from Firebase
 * Determines if device is active based on lastSyncTime being within 2 minutes
 * @param deviceId - The ID of the device to monitor
 * @returns Object containing device status information
 */
export function useDeviceStatus(deviceId: string): DeviceStatusHook {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Reset state when deviceId or user changes
    setIsLoading(true);
    setError(null);
    setIsActive(false);
    setLastSyncTime(null);

    // Don't proceed if user is not authenticated
    if (!user?.id || !deviceId) {
      setIsLoading(false);
      return;
    }

    console.log(`Setting up device status listener for device: ${deviceId}, user: ${user.id}`);

    // Create Firebase document reference
    const deviceRef = doc(db, 'users', user.id, 'devices', deviceId);

    // Set up real-time listener for device document
    const unsubscribe = onSnapshot(
      deviceRef,
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const deviceData = docSnapshot.data();
            const syncTime = deviceData.lastSyncTime;
            
            console.log(`Device ${deviceId} sync time:`, syncTime);

            if (syncTime) {
              // Convert lastSyncTime to Date object for comparison
              let syncDate: Date;
              
              if (typeof syncTime === 'number') {
                // Handle timestamp in milliseconds
                syncDate = new Date(syncTime);
              } else if (typeof syncTime === 'string') {
                // Handle ISO string
                syncDate = new Date(syncTime);
              } else if (syncTime.toDate && typeof syncTime.toDate === 'function') {
                // Handle Firebase Timestamp
                syncDate = syncTime.toDate();
              } else {
                throw new Error('Invalid lastSyncTime format');
              }

              // Check if sync time is valid
              if (isNaN(syncDate.getTime())) {
                throw new Error('Invalid sync time value');
              }

              // Calculate time difference in minutes
              const now = new Date();
              const timeDiffMs = now.getTime() - syncDate.getTime();
              const timeDiffMinutes = timeDiffMs / (1000 * 60);

              console.log(`Device ${deviceId} last sync: ${timeDiffMinutes.toFixed(2)} minutes ago`);

              // Device is active if synced within last 2 minutes
              const deviceIsActive = timeDiffMinutes <= 10;
              
              setIsActive(deviceIsActive);
              setLastSyncTime(syncDate.toISOString());
              setError(null);
            } else {
              // No sync time available - consider inactive
              console.log(`Device ${deviceId} has no lastSyncTime`);
              setIsActive(false);
              setLastSyncTime(null);
              setError(null);
            }
          } else {
            // Device document doesn't exist
            console.log(`Device ${deviceId} document not found`);
            setIsActive(false);
            setLastSyncTime(null);
            setError('Device not found');
          }
        } catch (err) {
          console.error(`Error processing device status for ${deviceId}:`, err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsActive(false);
          setLastSyncTime(null);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error(`Firebase listener error for device ${deviceId}:`, err);
        setError('Failed to connect to device status');
        setIsLoading(false);
        setIsActive(false);
        setLastSyncTime(null);
      }
    );

    // Cleanup subscription on unmount or dependency change
    return () => {
      console.log(`Cleaning up device status listener for device: ${deviceId}`);
      unsubscribe();
    };
  }, [deviceId, user?.id]);

  return {
    isActive,
    isLoading,
    error,
    lastSyncTime
  };
} 