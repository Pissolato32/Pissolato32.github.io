
'use server';
/**
 * @fileOverview Generates an image based on a given prompt using Genkit.
 * Includes conditional watermarking based on user role.
 *
 * - generateImage - A function that takes a prompt and returns an image data URI.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai, imageGenerationModelIdentifier} from '@/ai/genkit';
import {z} from 'genkit';

const UserRoleSchema = z.enum(['FREE', 'PRO', 'ADMIN']);

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
  userRole: UserRoleSchema.optional().describe('The role of the user, to determine if watermark is applied.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    let finalPrompt = input.prompt;

    if (input.userRole === 'FREE') {
      // Attempt to add watermark instruction to the prompt for FREE users
      finalPrompt = `${input.prompt}. Include a subtle text or watermark 'ImageGenAI' in one of the corners of the image.`;
    }

    const { media, text } = await ai.generate({
      model: imageGenerationModelIdentifier, 
      prompt: finalPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must provide both TEXT and IMAGE
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    });

    if (!media?.url) {
      let errorMessage = "Image generation failed. The model may not have returned an image.";
      if (text) {
        console.error('Image generation failed, model text response:', text);
        errorMessage += ` Model response: ${text}`;
      } else {
        console.error('Image generation failed and no media URL or text response was provided.');
      }
      throw new Error(errorMessage);
    }

    return {
      imageDataUri: media.url,
    };
  }
);
