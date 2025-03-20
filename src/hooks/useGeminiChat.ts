import { useState, useCallback } from 'react';
import { Message } from '../components/chat/ChatBox';
import { sendChatMessage, resetChat as resetChatSession } from '../services/chat';

interface UseGeminiChatProps {
  initialMessages?: Message[];
}

interface UseGeminiChatResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
}

export function useGeminiChat({
  initialMessages = [],
}: UseGeminiChatProps = {}): UseGeminiChatResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Send to server
      const response = await sendChatMessage(text, messages);

      // Add AI response to state
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.aiMessage,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err instanceof Error ? err : new Error('An error occurred'));
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
    // Reset server-side session
    resetChatSession().catch(err => {
      console.error('Error resetting chat session:', err);
    });
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
} 