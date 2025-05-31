import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  fetchNotifications, 
  getNotificationsFromFirebase, 
  updateNotificationReadStatus,
  markAllNotificationsAsRead,
  FirebaseNotification
} from '../services/notificationService';
import { useAuth } from './useAuth';
import { getUserDevices } from '../services/sensor';

interface NotificationHook {
  notifications: FirebaseNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

/**
 * Hook to manage notifications for the current user
 * @returns Object containing notifications and related state/functions
 */
export function useNotifications(): NotificationHook {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<FirebaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Function to fetch notifications for the user
  const refreshNotifications = async () => {
    if (!user) {
      console.log('[useNotifications] User not available, skipping refresh');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Poll the API for new notifications (this will also store them in Firebase)
      if (deviceId) {
        console.log(`[useNotifications] Polling API for notifications for userId: ${user.id}, deviceId: ${deviceId}`);
        
        await fetchNotifications({
          userId: user.id,
          deviceId: deviceId,
          daysback: 7 // Fetch notifications from the last 7 days
        });
      }
      
      // Step 2: Get notifications from Firebase
      console.log(`[useNotifications] Fetching notifications from Firebase for userId: ${user.id}`);
      const firebaseNotifications = await getNotificationsFromFirebase(user.id);
      
      console.log(`[useNotifications] Retrieved ${firebaseNotifications.length} notifications from Firebase`);
      setNotifications(firebaseNotifications);
    } catch (err) {
      console.error('[useNotifications] Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      
      // Only show alert for real errors, not when component unmounts
      if (err instanceof Error) {
        Alert.alert('Error', 'Failed to load notifications. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Update in Firebase
      await updateNotificationReadStatus(user.id, notificationId, true);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('[useNotifications] Error marking notification as read:', err);
      Alert.alert('Error', 'Failed to update notification status.');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Update in Firebase
      await markAllNotificationsAsRead(user.id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('[useNotifications] Error marking all notifications as read:', err);
      Alert.alert('Error', 'Failed to update notification statuses.');
    }
  };

  // Get the user's device on component mount
  useEffect(() => {
    const loadDeviceId = async () => {
      if (!user) return;
      
      try {
        const devices = await getUserDevices(user.id);
        if (devices.length > 0) {
          // Use the first device ID (we can enhance this later to support multiple devices)
          console.log('[useNotifications] Found device:', devices[0].id);
          setDeviceId(devices[0].id);
        } else {
          console.log('[useNotifications] No devices found for user');
        }
      } catch (err) {
        console.error('[useNotifications] Error getting user devices:', err);
      }
    };

    loadDeviceId();
  }, [user]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, deviceId]);

  // Set up polling for new notifications (every 10 minutes)
  useEffect(() => {
    const pollInterval = 600 * 10000; // 10 minutes
    let intervalId: number;

    if (user && deviceId) {
      console.log('[useNotifications] Setting up notification polling');
      intervalId = setInterval(refreshNotifications, pollInterval);
    }

    return () => {
      if (intervalId) {
        console.log('[useNotifications] Clearing notification polling interval');
        clearInterval(intervalId);
      }
    };
  }, [user, deviceId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  };
} 