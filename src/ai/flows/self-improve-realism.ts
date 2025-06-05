
'use server';
/**
 * @fileOverview An AI agent to analyze user feedback and generate structured suggestions
 * for improving the ImageGenAI tool. These suggestions are intended for admin review
 * and subsequent implementation via the AI Assistant.
 *
 * - selfImproveRealism - A function that handles the self-improvement suggestion process.
 * - SelfImproveRealismInput - The input type for the selfImproveRealism function.
 * - SelfImproveRealismOutput - The return type for the selfImproveRealism function.
 * - ImprovementSuggestion - The type for a single structured improvement suggestion.
 */

import {ai, premiumTextModelIdentifier} from '@/ai/genkit';
import {z} from 'genkit';

const SelfImproveRealismInputSchema = z.object({
  feedback: z.string().describe('Aggregated or example user feedback on generated images and the tool. This should cover various aspects like image quality, prompt understanding, parameter effects, etc.'),
  originalPrompt: z.string().optional().describe('An example of an original user prompt that might have led to mixed results or feedback.'),
  refinedPrompt: z.string().optional().describe('An example of an AI-refined prompt related to the feedback.'),
  imageParameters: z.record(z.any()).optional().describe('Example image parameters used that might be relevant to the feedback.'),
});
export type SelfImproveRealismInput = z.infer<typeof SelfImproveRealismInputSchema>;

const ImprovementSuggestionSchema = z.object({
  areaToImprove: z.string().describe("The specific area of image generation or prompt engineering that this suggestion addresses (e.g., 'Prompt Detail', 'Lighting', 'Anatomy', 'Image Parameter CFG Scale', 'Tool Feature')."),
  currentApproachOrProblem: z.string().describe("A brief description of the current approach, observed problem, or missing feature based on feedback analysis."),
  suggestedChange: z.string().describe("The specific, actionable change recommended (e.g., 'Modify the refine-prompt flow to emphasize X aspect for Y type of prompts', 'Suggest users try lower CFG scale for Z style images in the UI', 'Add a new tool for X')."),
  reasoning: z.string().describe("The rationale behind this suggestion, grounded in the provided feedback."),
  potentialImpact: z.string().describe("The expected positive impact or user benefit of implementing this change."),
});
export type ImprovementSuggestion = z.infer<typeof ImprovementSuggestionSchema>;

const SelfImproveRealismOutputSchema = z.object({
  success: z.boolean().describe('Whether the analysis and suggestion generation was successful.'),
  message: z.string().describe('A summary message of the operation, can include errors if not successful.'),
  overallAssessment: z.string().optional().describe("A high-level summary of feedback trends and overall system performance based on the input feedback."),
  improvementSuggestions: z.array(ImprovementSuggestionSchema).optional().describe('A list of structured suggestions for improving the image generation system or tool features.'),
});
export type SelfImproveRealismOutput = z.infer<typeof SelfImproveRealismOutputSchema>;

export async function selfImproveRealism(input: SelfImproveRealismInput): Promise<SelfImproveRealismOutput> {
  return selfImproveRealismFlow(input);
}

const analyzeAndSuggestPrompt = ai.definePrompt({
  name: 'analyzeAndSuggestPrompt',
  input: {schema: SelfImproveRealismInputSchema},
  output: {schema: SelfImproveRealismOutputSchema}, // Requesting the full structured output
  model: premiumTextModelIdentifier, // Use a powerful model for this complex task
  prompt: `You are an AI System Analyst and Improvement Strategist for ImageGenAI, an advanced AI image generation tool.
Your task is to meticulously analyze the provided user feedback, along with any example prompts and parameters, to identify key areas for improvement.
Based on your analysis, you must generate a structured list of actionable suggestions to enhance the tool's performance, realism of generated images, and user experience.

Provided Information:
- User Feedback (aggregated or example): {{{feedback}}}
{{#if originalPrompt}}- Example Original Prompt: {{{originalPrompt}}}{{/if}}
{{#if refinedPrompt}}- Example Refined Prompt: {{{refinedPrompt}}}{{/if}}
{{#if imageParameters}}- Example Image Parameters: {{{imageParameters}}}{{/if}}

Instructions for your output:
1.  **Overall Assessment**: Provide a concise, high-level summary of the feedback trends and the current state of the system as perceived from the feedback.
2.  **Improvement Suggestions**: Generate an array of specific, actionable improvement suggestions. Each suggestion MUST be an object with the following fields:
    *   'areaToImprove': (string) The specific area (e.g., 'Prompt Detail in Refinement Flow', 'Lighting Realism', 'Anatomical Accuracy', 'Image Parameter Defaults', 'UI Clarity for Parameters', 'New Feature Request').
    *   'currentApproachOrProblem': (string) Briefly describe the current system behavior, problem identified from feedback, or missing capability.
    *   'suggestedChange': (string) Propose a concrete, actionable change. Be specific. For example: "Modify the 'refinePrompt' flow's main prompt text to include more explicit instructions for detailing X when Y is mentioned." or "Consider adding a tooltip to the 'CFG Scale' slider explaining its effect on artistic vs. photorealistic styles." or "Develop a new Genkit tool named 'getArtisticStyleElements' that the 'refinePrompt' flow can use for prompts requesting specific art styles."
    *   'reasoning': (string) Explain why this change is needed, based directly on the provided feedback.
    *   'potentialImpact': (string) Describe the expected benefit to users or image quality.

Focus on suggestions that can be implemented by an admin instructing an AI coding assistant (like Firebase Studio) to modify TypeScript code (Genkit flows, Next.js components), or to update prompt engineering within existing flows.
Prioritize suggestions that address recurring issues or offer significant improvements.

Return your entire response as a single JSON object adhering to the SelfImproveRealismOutputSchema. Ensure 'success' is true if suggestions are generated. The 'message' field can summarize the process.
Example of a single suggestion object:
{
  "areaToImprove": "Anatomical Accuracy - Hands",
  "currentApproachOrProblem": "User feedback mentions generated images sometimes have distorted or incorrect numbers of fingers on hands.",
  "suggestedChange": "Update the 'refinePrompt' flow's prompt text, in the 'Physical and Anatomical Micro-Details' section, to add: 'Pay extremely close attention to hand anatomy; ensure correct finger count and natural poses. If generating humans, explicitly state 'five fingers per hand, naturally posed'.'",
  "reasoning": "Multiple users reported issues with hand generation, indicating this is a persistent problem.",
  "potentialImpact": "Improved realism and reduced artifacts in images featuring human hands, leading to higher user satisfaction."
}
Ensure the output is a valid JSON object matching the specified schema.
`,
  config: {
    responseFormat: 'json', // Request JSON output from the model
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const selfImproveRealismFlow = ai.defineFlow(
  {
    name: 'selfImproveRealismFlow',
    inputSchema: SelfImproveRealismInputSchema,
    outputSchema: SelfImproveRealismOutputSchema,
  },
  async (input): Promise<SelfImproveRealismOutput> => {
    try {
      const {output} = await analyzeAndSuggestPrompt(input);
      if (!output) {
        return {
            success: false,
            message: "AI analysis did not return any output.",
        };
      }
      // The model should directly return data matching SelfImproveRealismOutputSchema due to output schema and JSON mode
      return {
        success: true,
        message: output.message || "Successfully generated improvement suggestions.",
        overallAssessment: output.overallAssessment,
        improvementSuggestions: output.improvementSuggestions,
      };
    } catch (error) {
      console.error("Error in selfImproveRealismFlow:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
      return {
        success: false,
        message: `Failed to generate suggestions: ${errorMessage}`,
      };
    }
  }
);

