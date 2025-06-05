
'use server';

/**
 * @fileOverview Adjusts image generation parameters based on user feedback.
 *
 * - adjustImageParameters - A function that adjusts the image parameters.
 * - AdjustImageParametersInput - The input type for the adjustImageParameters function.
 * - AdjustImageParametersOutput - The return type for the adjustImageParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a specific schema for image parameters
const ImageParametersSchema = z.object({
  cfgScale: z.number().describe('The CFG scale for image generation. Typical range: 1-20.'),
  steps: z.number().int().describe('The number of generation steps. Typical range: 10-150.'),
  realismEnhancement: z.number().describe('The realism enhancement factor. Range: 0-1. This parameter might be adjusted or have a default if it is a premium feature.'),
}).describe('Specific image generation parameters.');

const AdjustImageParametersInputSchema = z.object({
  prompt: z.string().describe('The original image generation prompt.'),
  userFeedback: z.string().describe('User feedback on the generated image.'),
  initialParameters: ImageParametersSchema.describe('The initial image generation parameters used (cfgScale, steps, realismEnhancement).'),
});
export type AdjustImageParametersInput = z.infer<typeof AdjustImageParametersInputSchema>;

// Output schema should also use the specific ImageParametersSchema
const AdjustImageParametersOutputSchema = ImageParametersSchema;
export type AdjustImageParametersOutput = z.infer<typeof AdjustImageParametersOutputSchema>;

export async function adjustImageParameters(input: AdjustImageParametersInput): Promise<AdjustImageParametersOutput> {
  return adjustImageParametersFlow(input);
}

const adjustImageParametersPrompt = ai.definePrompt({
  name: 'adjustImageParametersPrompt',
  input: {schema: AdjustImageParametersInputSchema},
  output: {schema: AdjustImageParametersOutputSchema},
  prompt: `You are an AI image parameter tuning expert. The user is trying to generate an image from the prompt "{{prompt}}".
They have provided feedback "{{userFeedback}}" on the generated image. The initial parameters used were:
- CFG Scale: {{initialParameters.cfgScale}}
- Steps: {{initialParameters.steps}}
- Realism Enhancement: {{initialParameters.realismEnhancement}}

Based on this feedback, adjust these parameters (cfgScale, steps, realismEnhancement) to better generate images in the future.
Return ONLY a JSON object with the adjusted parameters, specifically 'cfgScale', 'steps', and 'realismEnhancement'.
Ensure that each parameter is within its respective valid range (cfgScale: 1-20, steps: 10-150, realismEnhancement: 0-1).`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const adjustImageParametersFlow = ai.defineFlow(
  {
    name: 'adjustImageParametersFlow',
    inputSchema: AdjustImageParametersInputSchema,
    outputSchema: AdjustImageParametersOutputSchema,
  },
  async input => {
    const {output} = await adjustImageParametersPrompt(input);
    return output!;
  }
);

