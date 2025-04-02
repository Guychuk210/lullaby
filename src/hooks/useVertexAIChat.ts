import { useState, useCallback } from 'react';
import { Message } from '../components/chat/ChatBox';
import { sendVertexAIMessage, resetVertexAIChat } from '../services';

interface UseVertexAIChatProps {
  initialMessages?: Message[];
}

interface UseVertexAIChatResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
}

/**
 * Hook for handling chat with Vertex AI agent
 * @param props Initial messages to populate the chat
 * @returns Chat state and methods
 */
export function useVertexAIChat({
  initialMessages = [],
}: UseVertexAIChatProps = {}): UseVertexAIChatResult {
  console.log('[useVertexAIChat] Initializing with', initialMessages.length, 'initial messages');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    console.log('[useVertexAIChat] Sending message:', text);
    if (!text.trim()) {
      console.log('[useVertexAIChat] Empty message, not sending');
      return;
    }

    try {
      console.log('[useVertexAIChat] Setting loading state');
      setIsLoading(true);
      setError(null);

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      console.log('[useVertexAIChat] Adding user message to state');
      setMessages((prev) => [...prev, userMessage]);

      // Send to Vertex AI service
      console.log('[useVertexAIChat] Calling Vertex AI service');
      const response = await sendVertexAIMessage(text, messages);
      console.log('[useVertexAIChat] Received response from Vertex AI:', response.aiMessage.substring(0, 50) + '...');

      // Add AI response to state
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.aiMessage,
        sender: 'ai',
        timestamp: new Date(),
      };
      console.log('[useVertexAIChat] Adding AI response to state');
      setMessages((prev) => [...prev, aiMessage]);
      console.log('[useVertexAIChat] Message exchange completed successfully');
    } catch (err) {
      console.error('[useVertexAIChat] Error in Vertex AI chat:', err);
      const errorObj = err instanceof Error ? err : new Error('An error occurred');
      console.error('[useVertexAIChat] Error details:', errorObj.message);
      setError(errorObj);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      console.log('[useVertexAIChat] Adding error message to chat');
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      console.log('[useVertexAIChat] Setting loading state to false');
      setIsLoading(false);
    }
  }, [messages]);

  const resetChat = useCallback(() => {
    console.log('[useVertexAIChat] Resetting chat');
    setMessages([]);
    setError(null);
    // Reset session if needed
    resetVertexAIChat().catch((err: Error) => {
      console.error('[useVertexAIChat] Error resetting Vertex AI chat session:', err);
    });
    console.log('[useVertexAIChat] Chat reset completed');
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
} 