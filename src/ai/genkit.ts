
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [googleAI()],
  // No default model here; flows will specify explicitly
});

// Export model NAME STRINGS, not model "instances"
export const standardTextModelIdentifier = 'googleai/gemini-2.0-flash'; // For Free tier text tasks
export const premiumTextModelIdentifier = 'googleai/gemini-1.5-pro-latest'; // For Pro/Admin tier text tasks
export const imageGenerationModelIdentifier = 'googleai/gemini-2.5-pro'; // Updated for best quality image generation for all tiers

