import { config } from 'dotenv';
config();

import '@/ai/flows/adjust-image-parameters.ts';
import '@/ai/flows/refine-prompt.ts';
import '@/ai/flows/self-improve-realism.ts';
import '@/ai/flows/generate-image-flow.ts'; // Added new image generation flow
