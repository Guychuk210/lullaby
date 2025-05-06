# Notification System Feature Documentation

## Overview
The notification system allows users to receive and view important messages from the Lullaby.AI service. This feature supports real-time notification updates, read/unread status tracking, and a visual badge indicator.

## Technical Implementation

### Backend Integration
- **API Endpoint**: `https://ezlaylmye9.execute-api.us-east-1.amazonaws.com/PROD/retriveNotifications`
- **Request Method**: GET
- **Parameters**:
  - `deviceId`: The device ID registered by the user
  - `userId`: The Firebase user ID

### Response Format
```json
{
  "count": 4,
  "items": [
    {
      "notificationDate": "2025-05-05",
      "deviceId": "EC:A3:45:0B:65:F4",
      "userId": "3qVaQXpCPtSADr9HSfhKykFzBOe2",
      "notificationText": "We've noticed an increase in wet nights...",
      "notificationTime": "2025-05-05T15:27:37.899670+00:00"
    }
  ]
}
```

## Application Components

### Notification Service
Located at `src/services/notificationService.ts`, this service:
- Defines interfaces for notification data
- Provides functions to fetch notifications from the API
- Processes raw notifications to prepare them for display
- Handles formatting dates (Today, Yesterday, etc.)

### Notification Hook
Located at `src/hooks/useNotifications.ts`, this hook:
- Manages notification state (loading, error, data)
- Tracks read/unread status
- Handles automatic polling for new notifications (every 60 seconds)
- Provides functions to mark notifications as read
- Automatically retrieves the user's device ID

### UI Integration
- **Notification Tab**: Displays notification count badge with unread notifications
- **Notification List**: Shows notifications with visual distinction for unread items
- **Pull-to-Refresh**: Allows manual refresh of notifications
- **Empty/Error States**: Proper handling of various states

## Usage

### In Components
```typescript
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  // Use the notifications data and functions
}
```

## Data Flow
1. When the Chat screen loads, it uses the `useNotifications` hook
2. The hook automatically:
   - Retrieves the user's device ID using `getUserDevices`
   - Fetches notifications using the notification service
   - Sets up polling for new notifications
3. The UI displays notifications with proper formatting and read status
4. When viewing notifications tab, all notifications are marked as read
5. Pull-to-refresh triggers a manual refresh

## Error Handling
- Connection errors display a user-friendly message with retry option
- Loading states show appropriate indicators
- Empty state is properly handled with a message

## Future Enhancements
- Server-side read status tracking
- Push notification support
- Notification preferences/settings
- Support for multiple devices
- Interactive notifications
- Notification categories/filtering 