import axios, { AxiosError } from 'axios';
import { Message, ConversationMessage, ContentItem } from '../components/chat/ChatBox';
import { config } from '../constants/config';

// Use the API URL from config
const API_URL = config.apiUrl;

console.log(`Using API URL: ${API_URL}`);

// Store the current user ID (in a real app, get this from auth)
let currentUserId: string = 'user-' + Date.now().toString();

// Convert legacy Message to new ConversationMessage format
export function convertToConversationMessage(message: Message): ConversationMessage {
  return {
    role: message.sender === 'ai' ? 'assistant' : 'user',
    content: [{ type: 'text', text: message.text }]
  };
}

// Store the chat session ID
let currentSessionId: string | null = null;

/**
 * Format error message from API error
 * @param error The error object
 * @returns A user-friendly error message
 */
function formatErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNREFUSED') {
      return 'Could not connect to the server. Please make sure the server is running.';
    }
    
    if (axiosError.response) {
      // Server responded with error
      const status = axiosError.response.status;
      
      if (status === 404) {
        return 'API endpoint not found. Please check server configuration.';
      } else if (status >= 500) {
        return 'Server error. Please try again later.';
      } else {
        return axiosError.response.data?.error || 'An error occurred with the request.';
      }
    } else if (axiosError.request) {
      // Request made but no response
      return 'No response from server. Please check your internet connection.';
    }
  }
  
  // Generic error
  return error instanceof Error ? error.message : 'An unknown error occurred';
}

/**
 * Send the entire conversation to the AI server
 * @param text The current message text
 * @param history Full message history
 * @param userId Optional user ID to use for the request
 * @returns The AI response
 */
export async function sendConversation(
  text: string,
  history: Message[],
  userId?: string
): Promise<{ aiMessage: ContentItem[]; userId: string }> {
  try {
    // Convert all messages to the new format
    const conversationHistory = history.map(convertToConversationMessage);
    
    // Add the current message to history
    const currentMessage: ConversationMessage = {
      role: 'user',
      content: [{ type: 'text', text }]
    };
    
    const messages = [...conversationHistory, currentMessage];
    
    console.log(`Sending conversation to ${API_URL}/ai/conversation with ${messages.length} messages`);
    
    // Use provided userId or fall back to the stored one
    const userIdentifier = userId || currentUserId;
    
    const response = await axios.post(`${API_URL}/ai/conversation`, {
      userId: userIdentifier,
      messages,
    });

    console.log('Received response:', response.data);
    
    // Extract the AI message content from the response
    if (!response.data || !response.data.message || !response.data.message.content) {
      throw new Error('Invalid response format from server');
    }

    return {
      aiMessage: response.data.message.content,
      userId: response.data.userId || userIdentifier,
    };
  } catch (error) {
    console.error('Error sending conversation:', error);
    const errorMessage = formatErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Send a message to the AI server
 * @param message The message to send
 * @param history Optional message history
 * @returns The AI response
 */
export async function sendChatMessage(
  message: string,
  history?: Message[]
): Promise<{ aiMessage: string; sessionId: string }> {
  try {
    const response = await axios.post(`${API_URL}/ai/chat`, {
      message,
      sessionId: currentSessionId,
      history: history?.map(msg => ({
        role: msg.sender,
        content: msg.text,
        timestamp: msg.timestamp,
      })),
    });

    // Store the session ID for future requests
    currentSessionId = response.data.sessionId;

    return {
      aiMessage: response.data.message,
      sessionId: response.data.sessionId,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    const errorMessage = formatErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Reset the chat session
 */
export async function resetChat(): Promise<void> {
  if (!currentSessionId) return;

  try {
    await axios.post(`${API_URL}/ai/reset`, {
      sessionId: currentSessionId,
    });
    currentSessionId = null;
  } catch (error) {
    console.error('Error resetting chat:', error);
    const errorMessage = formatErrorMessage(error);
    throw new Error(errorMessage);
  }
} 