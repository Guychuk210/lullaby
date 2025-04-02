/**
 * Test script to verify the VertexAI API connection
 * Run this from the terminal to test the server connection
 */
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.100.102.14:3001/api';

async function testVertexAISetup() {
  console.log('Starting VertexAI integration test');
  console.log('API URL:', API_URL);

  try {
    // Test 1: Check if the token endpoint is reachable
    console.log('\nTest 1: Checking token endpoint...');
    const tokenResponse = await axios.get(`${API_URL}/auth/gcloud-token`);
    
    console.log('Response status:', tokenResponse.status);
    console.log('Response has token:', !!tokenResponse.data?.token);
    
    if (tokenResponse.data?.token) {
      const tokenPreview = tokenResponse.data.token.substring(0, 10) + '...';
      console.log('Token preview:', tokenPreview);
      console.log('Token length:', tokenResponse.data.token.length);
      console.log('✅ Token endpoint is working properly');
    } else {
      console.error('❌ Token endpoint reachable but didn\'t return a valid token');
      console.log('Response data:', tokenResponse.data);
    }

    // Test 2: Try a simple query to Vertex AI
    if (tokenResponse.data?.token) {
      console.log('\nTest 2: Sending test query to Vertex AI...');
      
      const PROJECT_ID = Constants.expoConfig?.extra?.VERTEX_AI_PROJECT_ID || '284266420931';
      const LOCATION = Constants.expoConfig?.extra?.VERTEX_AI_LOCATION || 'global';
      const ENGINE_ID = Constants.expoConfig?.extra?.VERTEX_AI_ENGINE_ID || 'bed-wetting-expert_1743595681051';
      
      const AI_ENDPOINT = `https://discoveryengine.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/engines/${ENGINE_ID}/servingConfigs/default_search:answer`;
      
      console.log('Vertex AI endpoint:', AI_ENDPOINT);
      
      const accessToken = tokenResponse.data.token;
      
      const response = await axios.post(
        AI_ENDPOINT,
        {
          query: {
            text: "Hello, are you working?",
            queryId: `test_${Date.now()}`
          },
          session: `test_session_${Date.now()}`,
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
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Vertex AI response status:', response.status);
      console.log('Response structure:', Object.keys(response.data || {}));
      
      if (response.data?.answer) {
        console.log('✅ Vertex AI API is working properly');
        console.log('Response preview:', JSON.stringify(response.data.answer).substring(0, 100) + '...');
      } else {
        console.error('❌ Vertex AI API returned unexpected response format');
        console.log('Response data:', response.data);
      }
    }
    
    console.log('\nTests completed');
  } catch (error) {
    console.error('❌ Test failed with error:');
    
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Status text:', error.response?.statusText);
      console.error('Error message:', error.message);
      console.error('Response data:', error.response?.data);
    } else {
      console.error(error);
    }
  }
}

// You can export this function to use it in your app for testing
export { testVertexAISetup };

// Uncomment this line to run the test directly from this file
// testVertexAISetup(); 