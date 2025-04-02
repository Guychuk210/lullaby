/**
 * Run this file directly to test the VertexAI integration
 */

import { testVertexAISetup } from './testVertexAI';

// Run the test
testVertexAISetup()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed with uncaught error:', err)); 