import axios, { AxiosError } from 'axios';
import { Message } from '../components/chat/ChatBox';
import { config } from '../constants/config';

// Use the API URL from config
const API_URL = config.apiUrl;

console.log(`Using API URL: ${API_URL}`);

interface ChatSession {
  sessionId: string;
  messages: Message[];
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