import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ChatBox from '../../components/chat/ChatBox';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { config } from '../../constants/config';

function Chat() {
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
    if (!config.gemini.apiKey) {
      Alert.alert(
        'API Key Missing',
        'Please add your Gemini API key to the .env file to use the chat feature.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Add a simulated response since API is not available
              const simulatedResponse = {
                id: Date.now().toString(),
                text: "I'm a simulated response because the Gemini API key is not configured. Please add your API key to use the actual AI capabilities.",
                sender: 'ai' as const,
                timestamp: new Date(),
              };
              // We can't use the hook's setState directly here as it would cause issues with the API call flow
              setTimeout(() => {
                // This is a hacky way to simulate the response, in a real app with a valid API key
                // this wouldn't be necessary
                resetChat();
                setTimeout(() => {
                  sendMessage("Hi, this is a test message");
                }, 500);
              }, 1000);
            },
          },
        ]
      );
      return;
    }

    await sendMessage(text);
  };

  const handleResetChat = () => {
    Alert.alert(
      'Reset Chat',
      'Are you sure you want to clear this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetChat },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Support Chat</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetChat}>
          <Ionicons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Chat with Gemini</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error: {error.message || 'An error occurred'}
              </Text>
            </View>
          )}
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Gemini is thinking...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: theme.spacing.l,
    paddingTop: theme.padding.header,
    backgroundColor: colors.primary,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxl,
  },
  sectionContainer: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  resetButton: {
    padding: theme.spacing.s,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
  },
  errorText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.s,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.m,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    marginTop: theme.spacing.s,
  },
  loadingText: {
    marginLeft: theme.spacing.s,
    color: colors.text,
    fontSize: theme.typography.fontSize.s,
  },
});

export default Chat; 