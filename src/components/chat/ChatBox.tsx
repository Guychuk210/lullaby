import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

// This is the current Message interface, we'll keep for backwards compatibility
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// This is the new message format as required by the API
export interface ContentItem {
  type: 'text';
  text: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: ContentItem[];
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

function ChatBox({ messages, onSendMessage, isLoading = false }: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;
    onSendMessage(inputText);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAI = item.sender === 'ai';
    return (
      <View style={[styles.messageContainer, isAI ? styles.aiMessage : styles.userMessage]}>
        {isAI && (
          <View style={styles.avatarContainer}>
            <View style={styles.aiAvatar}>
              <Ionicons name="logo-electron" size={18} color={colors.white} />
            </View>
            <Text style={styles.avatarText}>Support</Text>
          </View>
        )}
        <View style={[
          styles.messageContent,
          isAI ? styles.aiMessageContent : styles.userMessageContent
        ]}>
          <Text style={[
            styles.messageText,
            isAI ? styles.aiMessageText : styles.userMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isAI ? styles.aiTimestamp : styles.userTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isLoading ? "Gemini is responding..." : "Type your message..."}
          placeholderTextColor={colors.gray[400]}
          multiline
          editable={!isLoading}
        />
        {isLoading ? (
          <View style={[styles.sendButton, styles.loadingButton]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputText.trim() === '' ? styles.sendButtonDisabled : styles.sendButtonActive
            ]} 
            onPress={handleSend}
            disabled={inputText.trim() === '' || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() === '' ? colors.gray[400] : colors.white} 
            />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    borderWidth: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  messagesList: {
    padding: 16,
    backgroundColor: colors.white,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
    flexDirection: 'row',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignItems: 'center',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 10,
    color: colors.gray[500],
    fontWeight: '600',
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiMessageContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
    borderWidth: 0,
  },
  userMessageContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
  },
  aiMessageText: {
    color: colors.text,
  },
  userMessageText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  aiTimestamp: {
    color: colors.gray[400],
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 12,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  loadingButton: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
    borderWidth: 1,
  },
});

export default ChatBox; 