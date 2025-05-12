import axios from 'axios';
import { collection, doc, setDoc, getDocs, updateDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { config } from '../constants/config';

/**
 * Interface for notification data received from the API
 */
export interface Notification {
  notificationDate: string;
  deviceId: string;
  userId: string;
  notificationText: string;
  notificationTime: string;
  read?: boolean; // Added for client-side tracking
  id?: string; // Added for client-side tracking
}

/**
 * Interface for the notification response from the API
 */
export interface NotificationResponse {
  count: number;
  items: Notification[];
}

/**
 * Interface for notification stored in Firebase
 */
export interface FirebaseNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  timestamp: number;
  read: boolean;
  notificationDate: string;
  deviceId: string;
  userId: string;
  notificationText: string;
  notificationTime: string;
  createdAt: number;
}

/**
 * Parameters required for fetching notifications
 */
interface FetchNotificationsParams {
  deviceId: string;
  userId: string;
  daysback?: number; // Added optional daysback parameter
}

/**
 * Fetches notifications from the API and stores them in Firebase
 * @param params - Object containing deviceId, userId, and optional daysback
 * @returns Promise with notification data
 */
export async function fetchNotifications(params: FetchNotificationsParams): Promise<NotificationResponse> {
  try {
    // Make API call to our server endpoint to retrieve notifications
    const response = await axios.get(
      `${config.apiUrl}/notifications/users/${params.userId}/devices/${params.deviceId}`,
      { params: { daysback: params.daysback } }
    );
    
    // Process the response to add client-side properties
    const enhancedItems = response.data.items.map((item: Notification) => ({
      ...item,
      read: false, // Default all notifications to unread
    }));
    
    // Store notifications in Firebase
    if (params.userId && enhancedItems.length > 0) {
      await storeNotificationsInFirebase(params.userId, enhancedItems);
    }
    
    return {
      count: response.data.count,
      items: enhancedItems,
    };
  } catch (error) {
    console.error('[NotificationService] Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications. Please try again later.');
  }
}

/**
 * Stores notifications in Firebase
 * @param userId - The user ID
 * @param notifications - Array of notifications to store
 */
async function storeNotificationsInFirebase(userId: string, notifications: Notification[]): Promise<void> {
  try {
    console.log(`[NotificationService] Storing notifications in Firebase for user ${userId}`);
    
    // Filter notifications to only include those matching the user's ID
    const userNotifications = notifications.filter(notification => 
      notification.userId === userId && notification.deviceId
    );
    
    console.log(`[NotificationService] Found ${userNotifications.length} notifications matching userId ${userId}`);
    
    const batch: Promise<void>[] = [];
    
    for (const notification of userNotifications) {
      const notificationId = notification.id || `${notification.userId}-${notification.notificationTime}`;
      const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
      
      // Check if notification already exists
      const docSnap = await getDoc(notificationRef);
      
      if (!docSnap.exists()) {
        // Create a processed notification for storage
        const processedNotification = processNotificationForFirebase(notification);
        
        // Add to batch
        batch.push(
          setDoc(notificationRef, processedNotification)
        );
      }
    }
    
    // Execute all promises
    if (batch.length > 0) {
      await Promise.all(batch);
      console.log(`[NotificationService] Successfully stored ${batch.length} new notifications in Firebase`);
    } else {
      console.log('[NotificationService] No new notifications to store');
    }
  } catch (error) {
    console.error('[NotificationService] Error storing notifications in Firebase:', error);
  }
}

/**
 * Process a notification for Firebase storage
 * @param notification - Raw notification from API
 * @returns Processed notification ready for Firebase storage
 */
function processNotificationForFirebase(notification: Notification): FirebaseNotification {
  // Parse the notification time
  const notificationDate = new Date(notification.notificationTime);
  
  // Format date for display (Today, Yesterday, or MM/DD/YYYY)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let displayDate;
  if (notificationDate.toDateString() === today.toDateString()) {
    displayDate = 'Today';
  } else if (notificationDate.toDateString() === yesterday.toDateString()) {
    displayDate = 'Yesterday';
  } else {
    displayDate = notificationDate.toLocaleDateString();
  }
  
  // Extract a title from the first part of the message
  const title = notification.notificationText.split('.')[0] + '.';
  const message = notification.notificationText.substring(title.length).trim();
  
  return {
    id: notification.id || `${notification.userId}-${notification.notificationTime}`,
    title,
    message,
    date: displayDate,
    timestamp: notificationDate.getTime(),
    read: notification.read || false,
    notificationDate: notification.notificationDate,
    deviceId: notification.deviceId,
    userId: notification.userId,
    notificationText: notification.notificationText,
    notificationTime: notification.notificationTime,
    createdAt: Date.now(),
  };
}

/**
 * Fetches notifications from Firebase
 * @param userId - The user ID 
 * @returns Array of notifications
 */
export async function getNotificationsFromFirebase(userId: string): Promise<FirebaseNotification[]> {
  try {
    console.log(`[NotificationService] Fetching notifications from Firebase for user ${userId}`);
    
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const notifications: FirebaseNotification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push(doc.data() as FirebaseNotification);
    });
    
    console.log(`[NotificationService] Retrieved ${notifications.length} notifications from Firebase`);
    return notifications;
  } catch (error) {
    console.error('[NotificationService] Error fetching notifications from Firebase:', error);
    throw new Error('Failed to load notifications. Please try again later.');
  }
}

/**
 * Updates a notification's read status in Firebase
 * @param userId - The user ID
 * @param notificationId - The notification ID to update
 * @param read - The new read status
 */
export async function updateNotificationReadStatus(
  userId: string, 
  notificationId: string, 
  read: boolean
): Promise<void> {
  try {
    console.log(`[NotificationService] Updating notification ${notificationId} read status to ${read}`);
    
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, { read });
    
    console.log('[NotificationService] Successfully updated notification read status');
  } catch (error) {
    console.error('[NotificationService] Error updating notification read status:', error);
    throw new Error('Failed to update notification status. Please try again later.');
  }
}

/**
 * Marks all notifications as read in Firebase
 * @param userId - The user ID
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    console.log(`[NotificationService] Marking all notifications as read for user ${userId}`);
    
    // Get all unread notifications
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    
    const querySnapshot = await getDocs(q);
    const batch: Promise<void>[] = [];
    
    querySnapshot.forEach((doc) => {
      batch.push(
        updateDoc(doc.ref, { read: true })
      );
    });
    
    // Execute all updates
    if (batch.length > 0) {
      await Promise.all(batch);
      console.log(`[NotificationService] Successfully marked ${batch.length} notifications as read`);
    } else {
      console.log('[NotificationService] No unread notifications to update');
    }
  } catch (error) {
    console.error('[NotificationService] Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read. Please try again later.');
  }
}

/**
 * Processes notifications to prepare them for display
 * @param notifications - Raw notification data from API
 * @returns Formatted notifications with display-friendly properties
 */
export function processNotificationsForDisplay(notifications: Notification[]): any[] {
  return notifications.map((notification) => {
    // Parse the notification time
    const notificationDate = new Date(notification.notificationTime);
    
    // Format date for display (Today, Yesterday, or MM/DD/YYYY)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let displayDate;
    if (notificationDate.toDateString() === today.toDateString()) {
      displayDate = 'Today';
    } else if (notificationDate.toDateString() === yesterday.toDateString()) {
      displayDate = 'Yesterday';
    } else {
      displayDate = notificationDate.toLocaleDateString();
    }
    
    // Extract a title from the first part of the message
    const title = notification.notificationText.split('.')[0] + '.';
    const message = notification.notificationText.substring(title.length).trim();
    
    return {
      id: notification.id || `${notification.userId}-${notification.notificationTime}`,
      title,
      message,
      date: displayDate,
      read: notification.read || false,
      timestamp: notificationDate,
      raw: notification, // Keep the raw data for reference
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by date (newest first)
} 