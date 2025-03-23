import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { config } from '../../constants/config';
import Header from '../../components/Header';

// Sample notification data
const notifications = [
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
  const [showNotifications, setShowNotifications] = React.useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, isLoading, error, sendMessage, resetChat } = useGeminiChat({
    initialMessages: [
      {
        id: '1',
        text: 'Hello! How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ],
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Show alert if there's a server connection error
  React.useEffect(() => {
    if (error) {
      if (error.message.includes('server') || error.message.includes('connect')) {
        Alert.alert(
          'Server Connection Error',
          'Could not connect to the chat server. Make sure the server is running at the correct URL.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [error]);

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text);
    } catch (e) {
      console.error('Error sending message:', e);
      Alert.alert(
        'Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleResetChat = () => {
    Alert.alert(
      'Reset Chat',
      'Are you sure you want to clear this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: () => {
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
    if (inputText.trim() === '') return;
    handleSendMessage(inputText);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lullaby.AI</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.chatButton, !showNotifications && styles.activeButton]}
            onPress={() => setShowNotifications(false)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
            <Text style={styles.chatButtonText}>AI Support Chat</Text>
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
            {!showNotifications && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showNotifications ? (
        <>
          {/* Notifications View */}
          <Text style={styles.screenTitle}>Notifications</Text>
          <ScrollView style={styles.contentContainer}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationDate}>{notification.date}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          {/* Chat title with reset button */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>AI Support Chat</Text>
            <TouchableOpacity onPress={handleResetChat} style={styles.resetButton}>
              <Ionicons name="refresh" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Chat messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContentContainer}
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
                    <Text style={styles.messageSender}>Support</Text>
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
                <Text style={styles.loadingText}>AI is thinking...</Text>
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
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.gray[600],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: colors.gray[700],
  },
  chatButtonText: {
    color: colors.white,
    marginLeft: 4,
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    alignSelf: 'center',
  },
  loadingText: {
    marginLeft: 8,
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
});

export default Chat; 