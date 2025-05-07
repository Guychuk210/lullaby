import { useState, useCallback } from 'react';
import { Message, ContentItem } from '../components/chat/ChatBox';
import { sendChatMessage, resetChat as resetChatSession, sendConversation } from '../services/chat';

interface UseChatProps {
  initialMessages?: Message[];
  userId?: string;
}

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
}

/**
 * Hook for handling chat with the AI assistant
 * @param props Initial messages to populate the chat and optional userId
 * @returns Chat state and methods
 */
export function useChat({
  initialMessages = [],
  userId = undefined,
}: UseChatProps = {}): UseChatResult {
  console.log('[useChat] Initializing with', initialMessages.length, 'initial messages');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    console.log('[useChat] Sending message:', text);
    if (!text.trim()) {
      console.log('[useChat] Empty message, not sending');
      return;
    }

    try {
      console.log('[useChat] Setting loading state');
      setIsLoading(true);
      setError(null);

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      console.log('[useChat] Adding user message to state');
      setMessages((prev) => [...prev, userMessage]);

      // Send to new conversation API with entire chat history
      console.log('[useChat] Calling conversation API with full history');
      let response;
      try {
        response = await sendConversation(text, messages, userId);
        console.log('[useChat] Received response from conversation API:', response);
      } catch (convError) {
        console.error('[useChat] Error in conversation API:', convError);
        throw convError;
      }

      // Get the text from the content items
      let responseText = "I couldn't process your request at this time.";
      
      if (response.aiMessage && response.aiMessage.length > 0) {
        // Combine all text content from the response
        responseText = response.aiMessage
          .filter(item => item.type === 'text' && item.text)
          .map(item => item.text)
          .join('\n\n');
          
        if (!responseText) {
          responseText = "I couldn't process your request at this time.";
        }
      }

      // Add AI response to state
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      console.log('[useChat] Adding AI response to state');
      setMessages((prev) => [...prev, aiMessage]);
      console.log('[useChat] Message exchange completed successfully');
    } catch (err) {
      console.error('[useChat] Error in chat:', err);
      const errorObj = err instanceof Error ? err : new Error('An error occurred');
      console.error('[useChat] Error details:', errorObj.message);
      setError(errorObj);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      console.log('[useChat] Adding error message to chat');
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      console.log('[useChat] Setting loading state to false');
      setIsLoading(false);
    }
  }, [messages, userId]);

  const resetChat = useCallback(() => {
    console.log('[useChat] Resetting chat');
    setMessages([]);
    setError(null);
    // Reset session if needed
    resetChatSession().catch((err: Error) => {
      console.error('[useChat] Error resetting chat session:', err);
    });
    console.log('[useChat] Chat reset completed');
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
} 