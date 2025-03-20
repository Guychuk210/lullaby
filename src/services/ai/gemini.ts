import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../constants/config';
import Constants from 'expo-constants';

// Get API key from Expo Constants (set in app.config.js) or from config file
const API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || config.gemini.apiKey || '';

// Initialize the Gemini API client
let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * Send a message to Gemini and get a response
 * @param message - The user's message
 * @param history - Previous messages for context
 * @returns The AI response text
 */
export async function sendMessageToGemini(
  message: string,
  history: { sender: 'user' | 'ai'; text: string }[] = []
): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    
    if (!genAI) {
      genAI = new GoogleGenerativeAI(API_KEY);
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert history to Gemini format
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Create a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Send the message and get a response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    throw error;
  }
}

/**
 * Convert our app's message format to Gemini's format
 * @param messages - Array of messages in our app format
 * @returns Array of messages in Gemini format
 */
export function convertToGeminiHistory(
  messages: { sender: 'user' | 'ai'; text: string }[]
): { role: 'user' | 'model'; parts: string[] }[] {
  return messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [msg.text],
  }));
} 