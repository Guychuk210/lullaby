import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../hooks/useNotifications';
import { config } from '../../constants/config';
import Header from '../../components/Header';
import { Message, ConversationMessage, ContentItem } from '../../components/chat/ChatBox';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth'; // Uncommented the auth hook
import { useNavigation } from '@react-navigation/native';

// Sample notification data
const sampleNotifications = [
  {
    id: '1',
    title: 'Welcome to our app!',
    message: 'Thank you for joining our platform. We\'re excited to have you with us!',
    date: 'Yesterday',
    read: true
  },
  {
    id: '2',
    title: 'New feature available',
    message: 'Check out our new notification system that allows you to stay updated with important messages.',
    date: 'Today',
    read: false
  },
  {
    id: '3',
    title: 'Reminder',
    message: 'Don\'t forget to complete your profile information for a better experience.',
    date: 'Today',
    read: false
  }
];

function Chat() {
  console.log('[Chat] Component initializing');
  
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = route.params as { showNotifications?: boolean; userId?: string } || {};
  
  // Set initial state based on navigation params
  const [showNotifications, setShowNotifications] = useState(params.showNotifications || false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get user ID for API requests using the auth hook
  const { user } = useAuth();
  const userId = user?.id || params.userId || 'anonymous-user';
  
  // Use the notifications hook to get and manage notifications
  const { 
    notifications: hookNotifications, 
    unreadCount, 
    isLoading: notificationsLoading, 
    error: notificationsError,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Local notifications state as fallback
  const [localNotifications, setLocalNotifications] = useState(sampleNotifications);
  
  // Use hook notifications if available, otherwise use local notifications
  const notifications = hookNotifications?.length > 0 ? hookNotifications : localNotifications;
  
  // Define the initial message
  const initialMessage: Message = {
    id: '1',
    text: 'Hello! I\'m your bedwetting expert AI assistant. How can I help you today?',
    sender: 'ai',
    timestamp: new Date(),
  };
  
  // Use the chat hook directly within the component
  const {
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    resetChat
  } = useChat({
    initialMessages: [initialMessage],
    userId: userId,
  });

  console.log('[Chat] Current message count:', messages.length);
  console.log('[Chat] Is loading state:', isLoading);
  console.log('[Chat] Error state:', error?.message || 'No error');
  console.log('[Chat] Notification count:', notifications.length);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('[Chat] Messages updated, scrolling to bottom');
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 20);
    }
  }, [messages]);

  // Show alert if there's a server connection error
  React.useEffect(() => {
    if (error) {
      console.error('[Chat] Error detected:', error.message);
      if (error.message.includes('server') || error.message.includes('connect') || error.message.includes('auth')) {
        console.log('[Chat] Showing alert for connection error');
        Alert.alert(
          'Connection Error',
          error.message,
          [{ text: 'OK' }]
        );
      }
    }
  }, [error]);

  const handleSendMessage = async (text: string) => {
    console.log('[Chat] Handling send message:', text);
    try {
      // The sendMessage function in useChat now handles sending the entire conversation history
      await sendMessage(text);
      console.log('[Chat] Message sent successfully');
    } catch (e) {
      console.error('[Chat] Error sending message:', e);
      Alert.alert(
        'Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleNotifications = () => {
    console.log('[Chat] Toggling notifications from', showNotifications, 'to', !showNotifications);
    setShowNotifications(!showNotifications);
  };

  const handleResetChat = () => {
    console.log('[Chat] Reset chat triggered');
    Alert.alert(
      'Reset Chat',
      'Are you sure you want to clear this conversation?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('[Chat] Reset cancelled') },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: () => {
            console.log('[Chat] Performing chat reset');
            resetChat();
          }
        },
      ]
    );
  };

  const [inputText, setInputText] = React.useState('');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = () => {
    if (inputText.trim() === '') {
      console.log('[Chat] Empty input, not sending');
      return;
    }
    console.log('[Chat] Sending message from input:', inputText.trim());
    console.log(`[Chat] Current conversation has ${messages.length} messages with userId: ${userId}`);
    handleSendMessage(inputText);
    setInputText('');
  };

  // Handle pull-to-refresh for notifications
  const onRefresh = async () => {
    console.log('[Chat] Refreshing notifications...');
    setRefreshing(true);
    
    // Add a safety timeout to prevent infinite loading state
    const refreshTimeout = setTimeout(() => {
      console.log('[Chat] Refresh timeout triggered');
      setRefreshing(false);
    }, 5000); // 5 seconds timeout
    
    try {
      // If refreshNotifications function exists, call it
      if (typeof refreshNotifications === 'function') {
        await refreshNotifications();
      } else {
        // Force refresh by simulating notifications update
        console.log('[Chat] Using direct state update for notifications refresh');
        // Wait a moment to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update local notifications with a new entry to simulate refresh
        const newNotification = {
          id: Date.now().toString(),
          title: 'Refreshed Notification',
          message: `This is a new notification that appeared after refreshing at ${new Date().toLocaleTimeString()}`,
          date: 'Just now',
          read: false
        };
        
        setLocalNotifications(prev => [newNotification, ...prev]);
      }
      console.log('[Chat] Notifications refreshed successfully');
    } catch (error) {
      console.error('[Chat] Error refreshing notifications:', error);
    } finally {
      clearTimeout(refreshTimeout);
      setRefreshing(false);
    }
  };

  // Add debug counter
  const [debugTapCount, setDebugTapCount] = useState(0);
  const [showDebugMenu, setShowDebugMenu] = useState(false);

  const handleTitlePress = () => {
    setDebugTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        console.log('[Chat] Debug mode activated');
        setShowDebugMenu(true);
        return 0;
      }
      return newCount;
    });
  };

  // Add keyboard state tracking
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 1}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleTitlePress}>
            <Text style={styles.headerTitle}>Numah.AI</Text>
          </TouchableOpacity>
          
          {/* Debug Menu Modal */}
          <Modal
            visible={showDebugMenu}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDebugMenu(false)}
          >
            <View style={styles.debugModalContainer}>
              <View style={styles.debugModalContent}>
                <Text style={styles.debugTitle}>Debug Menu</Text>
                
                <TouchableOpacity 
                  style={[styles.debugButton, { backgroundColor: 'gray' }]}
                  onPress={() => setShowDebugMenu(false)}
                >
                  <Text style={styles.debugButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[
                styles.chatButton, 
                showNotifications ? styles.inactiveChatButton : styles.activeChatButton
              ]}
              onPress={() => setShowNotifications(false)}
            >
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={20} 
                color={showNotifications ? colors.text : colors.white} 
              />
              <Text style={[
                styles.chatButtonText,
                showNotifications ? {color: colors.text} : {color: colors.white}
              ]}>Bedwetting Expert</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.notificationButton, showNotifications && styles.activeNotificationButton]}
              onPress={toggleNotifications}
            >
              <Ionicons name="notifications-outline" size={20} color={showNotifications ? colors.white : "black"} />
              <Text style={[
                styles.notificationButtonText, 
                showNotifications && styles.activeNotificationButtonText
              ]}>Notifications</Text>
              {!showNotifications && unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {showNotifications ? (
          <>
            {/* Notifications View */}
            <Text style={styles.screenTitle}>Notifications</Text>
            <ScrollView 
              style={styles.contentContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                  progressBackgroundColor={colors.white}
                  title="Pull to refresh"
                  titleColor={colors.gray[500]}
                />
              }
            >
              {notificationsError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
                  <Text style={styles.errorText}>{notificationsError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={refreshNotifications}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off-outline" size={50} color={colors.gray[400]} />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity 
                    key={notification.id} 
                    style={[
                      styles.notificationCard,
                      !notification.read && styles.unreadNotification
                    ]}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <View style={styles.notificationContent}>
                      {!notification.read && (
                        <View style={styles.unreadIndicator} />
                      )}
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationDate}>{notification.date}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <>
            {/* Chat title with reset button */}
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Bedwetting Expert Chat</Text>
              <TouchableOpacity onPress={handleResetChat} style={styles.resetButton}>
                <Ionicons name="refresh" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Chat messages */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.chatContainer}
              contentContainerStyle={styles.chatContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message) => (
                <View 
                  key={message.id} 
                  style={[
                    styles.messageContainer,
                    message.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer
                  ]}
                >
                  {message.sender === 'ai' && (
                    <View style={styles.messageHeader}>
                      <Ionicons name="person-circle-outline" size={20} color="black" />
                      <Text style={styles.messageSender}>Bedwetting Expert</Text>
                      <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
                    </View>
                  )}
                  <View style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userMessageBubble : styles.aiMessageBubble
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
                    ]}>
                      {message.text}
                    </Text>
                  </View>
                  {message.sender === 'user' && (
                    <Text style={styles.userMessageTime}>{formatTime(message.timestamp)}</Text>
                  )}
                </View>
              ))}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Expert is thinking...</Text>
                </View>
              )}
            </ScrollView>

            {/* Message input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() ? colors.white : colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>
          </>
        )}

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
  },
  activeChatButton: {
    backgroundColor: colors.gray[700],
    borderColor: colors.gray[700],
  },
  inactiveChatButton: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
  },
  chatButtonText: {
    marginLeft: 4,
    fontSize: 14,
  },
  activeChatButtonText: {
    color: colors.white,
  },
  inactiveChatButtonText: {
    color: colors.text,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[300],
    flex: 1,
    position: 'relative',
  },
  activeNotificationButton: {
    backgroundColor: colors.gray[600],
    borderColor: colors.gray[600],
  },
  notificationButtonText: {
    color: colors.text,
    marginLeft: 4,
    fontSize: 14,
  },
  activeNotificationButtonText: {
    color: colors.white,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  resetButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    paddingHorizontal: 16,
    color: colors.text,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: colors.gray[400],
    marginLeft: 10,
  },
  userMessageTime: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 4,
    textAlign: 'right',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: colors.gray[200],
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.text,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.gray[500],
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  // Notification styles
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
    marginBottom: theme.spacing.s,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.gray[500],
    textAlign: 'right',
  },
  debugModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  debugModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  debugButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Add new styles for notification features
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: colors.gray[500],
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: colors.gray[500],
    fontSize: 16,
  },
  unreadNotification: {
    backgroundColor: colors.gray[100],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default Chat; 