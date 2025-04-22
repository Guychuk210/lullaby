import axios, { AxiosError } from 'axios';
import { Message } from '../components/chat/ChatBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { config } from '../constants/config';

// Get constants from Expo configuration
const PROJECT_ID = Constants.expoConfig?.extra?.VERTEX_AI_PROJECT_ID || '284266420931';
const LOCATION = Constants.expoConfig?.extra?.VERTEX_AI_LOCATION || 'global';
const ENGINE_ID = Constants.expoConfig?.extra?.VERTEX_AI_ENGINE_ID || 'bed-wetting-expert_1743595681051';
const API_URL = config.apiUrl;
// Log configuration values for debugging
console.log('[VertexAI] Configuration:', {
  PROJECT_ID,
  LOCATION,
  ENGINE_ID,
  API_URL
});

// Vertex AI API endpoint
const API_ENDPOINT = `https://discoveryengine.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/engines/${ENGINE_ID}/servingConfigs/default_search:answer`;
console.log('[VertexAI] API Endpoint:', API_ENDPOINT);

// Storage keys
const ACCESS_TOKEN_KEY = 'vertex_ai_access_token';
const TOKEN_EXPIRY_KEY = 'vertex_ai_token_expiry';

// Session ID for conversation tracking
let currentSessionId: string | null = null;

/**
 * Format error message from API error
 * @param error The error object
 * @returns A user-friendly error message
 */
function formatErrorMessage(error: unknown): string {
  console.log('[VertexAI] Formatting error:', error);
  let errorMessage = 'An unknown error occurred';
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    console.log('[VertexAI] Axios error details:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      code: axiosError.code,
      message: axiosError.message
    });
    
    if (axiosError.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to the Vertex AI server.';
    } else if (axiosError.response) {
      const status = axiosError.response.status;
      
      if (status === 401 || status === 403) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (status === 404) {
        errorMessage = 'API endpoint not found. Please check configuration.';
      } else if (status >= 500) {
        errorMessage = 'Vertex AI server error. Please try again later.';
      } else {
        const responseData = axiosError.response.data;
        errorMessage = responseData && responseData.error && responseData.error.message 
          ? responseData.error.message 
          : 'An error occurred with the request.';
      }
    } else if (axiosError.request) {
      errorMessage = 'No response from Vertex AI server. Please check your internet connection.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    console.log('[VertexAI] Standard error:', error.message);
  }
  
  console.log('[VertexAI] Formatted error message:', errorMessage);
  return errorMessage;
}

/**
 * Get a valid access token for Google Cloud
 * Attempts to use a stored token first, generates a new one if needed
 */
export async function getAccessToken(): Promise<string> {
  console.log('[VertexAI] Getting access token');
  try {
    // Try to get token from secure storage
    console.log('[VertexAI] Checking for stored token');
    const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const tokenExpiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    
    console.log('[VertexAI] Stored token exists:', !!storedToken);
    console.log('[VertexAI] Token expiry exists:', !!tokenExpiry);
    
    // Check if token exists and is still valid (with 5 min buffer)
    if (storedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      const currentTime = Date.now();
      const timeRemaining = expiryTime - currentTime;
      
      console.log('[VertexAI] Token expiry time remaining:', Math.floor(timeRemaining / 1000 / 60), 'minutes');
      
      // Token is still valid
      if (expiryTime > currentTime + 5 * 60 * 1000) {
        console.log('[VertexAI] Using existing token');
        return storedToken;
      }
      console.log('[VertexAI] Token expired or expiring soon, fetching new token');
    }
    
    // Need to generate a new token - using server endpoint
    const tokenEndpoint = `${API_URL}/auth/gcloud-token`;
    console.log('[VertexAI] Fetching new token from:', tokenEndpoint);
    
    const response = await axios.get(tokenEndpoint);
    console.log('[VertexAI] Token response status:', response.status);
    console.log('[VertexAI] Token response structure:', Object.keys(response.data));
    
    if (!response.data?.token) {
      console.error('[VertexAI] Token missing from response', response.data);
      throw new Error('Failed to retrieve access token from server');
    }
    
    // Store the new token (typically valid for 1 hour)
    const newToken = response.data.token;
    console.log('[VertexAI] Received new token (first 5 chars):', newToken.substring(0, 5) + '...');
    
    const expiryTime = Date.now() + 55 * 60 * 1000; // 55 minutes to be safe
    console.log('[VertexAI] Setting token expiry:', new Date(expiryTime).toISOString());
    
    console.log('[VertexAI] Storing token in secure storage');
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newToken);
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    console.log('[VertexAI] New token stored successfully');
    return newToken;
  } catch (error) {
    console.error('[VertexAI] Error getting access token:', error);
    console.error('[VertexAI] Error details:', JSON.stringify(error, null, 2));
    throw new Error('Failed to authenticate with Google Cloud. Please try again.');
  }
}

/**
 * Send a message to the Vertex AI agent
 * @param message The message to send
 * @param history Optional message history
 * @returns The AI response
 */
export async function sendVertexAIMessage(
  message: string,
  history?: Message[]
): Promise<{ aiMessage: string; sessionId: string }> {
  console.log('[VertexAI] Sending message to Vertex AI:', message);
  console.log('[VertexAI] Message history length:', history?.length || 0);
  
  try {
    // Get access token
    console.log('[VertexAI] Getting access token');
    const accessToken = await getAccessToken();
    console.log('[VertexAI] Received access token');
    
    // Generate a session ID if not already created
    if (!currentSessionId) {
      currentSessionId = ``;
      console.log('[VertexAI] Created new session ID:', currentSessionId);
    } else {
      console.log('[VertexAI] Using existing session ID:', currentSessionId);
    }
    
    // Format the request body
    const queryId = ``;
    console.log('[VertexAI] Generated query ID:', queryId);
    
    const requestBody = {
      query: {
        text: message,
        queryId: queryId
      },
      session: currentSessionId,
      relatedQuestionsSpec: {
        enable: true
      },
      answerGenerationSpec: {
        ignoreAdversarialQuery: true,
        ignoreNonAnswerSeekingQuery: false,
        ignoreLowRelevantContent: true,
        multimodalSpec: {},
        includeCitations: true,
        modelSpec: {
          modelVersion: "stable"
        }
      }
    };
    
    console.log('[VertexAI] Request payload:', JSON.stringify(requestBody, null, 2));
    console.log('[VertexAI] Making API request to:', API_ENDPOINT);
    
    // Make the API request
    const response = await axios.post(
      API_ENDPOINT,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('[VertexAI] Response status:', response.status);
    console.log('[VertexAI] Response structure:', Object.keys(response.data || {}));
    
    // Extract and format the AI response
    let aiMessage = '';
    
    // Log the full response for debugging
    console.log('[VertexAI] Full response structure:', JSON.stringify(response.data));
    
    // First check for answerText in the answer object (based on the log you provided)
    if (response.data?.answer?.answerText) {
      aiMessage = response.data.answer.answerText;
      console.log('[VertexAI] Found response in answer.answerText');
    } 
    // Fall back to the previously checked locations
    else if (response.data?.answer?.content?.text) {
      aiMessage = response.data.answer.content.text;
      console.log('[VertexAI] Found response in answer.content.text');
    } else if (response.data?.answer?.answer) {
      aiMessage = response.data.answer.answer;
      console.log('[VertexAI] Found response in answer.answer');
    } else if (typeof response.data?.answer === 'string') {
      // Sometimes the answer might be directly a string
      aiMessage = response.data.answer;
      console.log('[VertexAI] Found response directly in answer string');
    } else {
      // If we can't find the answer in the expected locations, let's check the entire response for anything that looks like an answer
      console.log('[VertexAI] No response content found in standard locations');
      
      // Check if there's any field containing 'text', 'answer', or 'content' in the response
      const potentialTextFields = findAllTextFields(response.data);
      if (potentialTextFields.length > 0) {
        aiMessage = potentialTextFields[0];
        console.log('[VertexAI] Found potential answer in:', potentialTextFields[0].substring(0, 50) + '...');
      } else {
        aiMessage = 'I could not generate a response at this time.';
        console.log('[VertexAI] No response content found anywhere');
        console.log('[VertexAI] Full response data:', JSON.stringify(response.data, null, 2));
      }
    }
    
    console.log('[VertexAI] AI message length:', aiMessage.length);
    console.log('[VertexAI] AI message preview:', aiMessage.substring(0, 50) + '...');
    
    // Check for related questions if available
    if (response.data?.relatedQuestions?.questions && response.data.relatedQuestions.questions.length > 0) {
      console.log('[VertexAI] Found related questions:', response.data.relatedQuestions.questions.length);
      aiMessage += '\n\nYou might also want to ask about:';
      response.data.relatedQuestions.questions.slice(0, 3).forEach((q: { question: string }, index: number) => {
        console.log(`[VertexAI] Related question ${index + 1}:`, q.question);
        aiMessage += `\n• ${q.question}`;
      });
    } else if (response.data?.answer?.relatedQuestions && Array.isArray(response.data.answer.relatedQuestions)) {
      console.log('[VertexAI] Found related questions in answer object:', response.data.answer.relatedQuestions.length);
      aiMessage += '\n\nYou might also want to ask about:';
      response.data.answer.relatedQuestions.slice(0, 3).forEach((q: string, index: number) => {
        console.log(`[VertexAI] Related question ${index + 1}:`, q);
        aiMessage += `\n• ${q}`;
      });
    } else {
      console.log('[VertexAI] No related questions found');
    }
    
    console.log('[VertexAI] Successfully processed response');
    return {
      aiMessage,
      sessionId: currentSessionId
    };
  } catch (error) {
    console.error('[VertexAI] Error sending message to Vertex AI:', error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('[VertexAI] Axios error response:', axiosError.response?.data);
      console.error('[VertexAI] Axios error status:', axiosError.response?.status);
      console.error('[VertexAI] Axios error headers:', axiosError.response?.headers);
    }
    
    const errorMessage = formatErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Recursively find all text fields in a complex object
 * @param obj The object to search through
 * @returns Array of string values found
 */
function findAllTextFields(obj: any, results: string[] = []): string[] {
  if (!obj || typeof obj !== 'object') return results;
  
  // Check each property of the object
  for (const key in obj) {
    if (typeof obj[key] === 'string' && obj[key].length > 20) {
      // If it's a string with reasonable length, add it to results
      results.push(obj[key]);
    } else if (typeof obj[key] === 'object') {
      // If it's an object or array, recursively search it
      findAllTextFields(obj[key], results);
    }
  }
  
  return results;
}

/**
 * Reset the Vertex AI chat session
 */
export async function resetVertexAIChat(): Promise<void> {
  console.log('[VertexAI] Resetting chat session');
  currentSessionId = null;
  console.log('[VertexAI] Session ID reset');
} 