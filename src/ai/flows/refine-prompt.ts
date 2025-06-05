
'use server';

/**
 * @fileOverview This file defines a Genkit flow for assessing and, if necessary,
 * refining user prompts to generate highly realistic images.
 * It includes a simulated web search tool to gather additional context for realism.
 * It uses different models based on user role (Free vs. Pro/Admin).
 *
 * - refinePrompt - A function that takes a user prompt and returns a refined prompt optimized for realistic image generation.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import {ai, standardTextModelIdentifier, premiumTextModelIdentifier} from '@/ai/genkit';
import {z} from 'genkit';

const UserRoleSchema = z.enum(['FREE', 'PRO', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

const RefinePromptInputSchema = z.object({
  userPrompt: z.string().describe('The original prompt provided by the user.'),
  userRole: UserRoleSchema.optional().describe('The role of the user, to determine model usage.'),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinePromptOutputSchema = z.object({
  refinedPrompt: z.string().describe('The AI-assessed and potentially refined prompt, optimized for generating hyper-realistic images with extreme attention to micro-details.'),
  modelUsed: z.string().describe('The model used for refinement.'),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

// Simulated Web Search Tool
const WebSearchResultsInputSchema = z.object({
  query: z.string().describe('The search query, e.g., "cozy coffee shop interior" or "cyberpunk cityscape details".'),
});

const WebSearchResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of simulated search results providing context, common elements, or descriptive details related to the query.'),
});

const getWebSearchResults = ai.defineTool(
  {
    name: 'getWebSearchResults',
    description: "Simulates a web search to gather general knowledge, common associations, and descriptive details related to a query. Useful for finding typical characteristics of objects, scenes, or styles to enhance prompt realism when a prompt is being refined.",
    inputSchema: WebSearchResultsInputSchema,
    outputSchema: WebSearchResultsOutputSchema,
  },
  async (input) => {
    // Simulate search results - in a real scenario, this would call an actual search API.
    const query = input.query.toLowerCase();
    if (query.includes("beach") && query.includes("sunset")) {
      return { summary: "Typical beach sunsets feature warm golden light, long shadows from palm trees or dunes, reflections on wet sand, and calm ocean waves. Often includes details like seashells, driftwood, or distant boats. The sky is often painted in hues of orange, pink, and purple." };
    }
    if (query.includes("forest") && (query.includes("path") || query.includes("clearing"))) {
      return { summary: "Forest paths or clearings are often dappled with sunlight filtering through a dense canopy. Common elements include mossy rocks, fallen leaves, ferns, and gnarled tree roots. The atmosphere can be serene or mysterious. Consider details like wildflowers, small streams, or wildlife." };
    }
    if (query.includes("cyberpunk") && query.includes("city")) {
      return { summary: "Cyberpunk cities are characterized by towering neon-lit skyscrapers, holographic advertisements, crowded, narrow streets with diverse inhabitants, advanced technology integrated into daily life (like cybernetics), and often a gritty, rain-slicked aesthetic with lots of reflective surfaces." };
    }
    if (query.includes("cafe") || query.includes("coffee shop")) {
      return { summary: "Cozy coffee shops often feature warm lighting, comfortable seating (like armchairs or wooden benches), bookshelves, plants, the aroma of coffee, and art on the walls. Details might include steam rising from cups, pastries on display, and a relaxed atmosphere."};
    }
    if (query.includes("gym") || query.includes("fitness center") || query.includes("selfie") || query.includes("post-workout")) {
        return { summary: "Gym selfies or post-workout scenes often feature well-lit environments with a mix of natural and artificial light, mirrors, fitness equipment (dumbbells, machines, treadmills). Subjects wear athletic attire. Key authentic details include visible sweat (drops on skin, damp hair), slightly flushed skin, natural (not overly posed) expressions of effort, satisfaction, or exhaustion. Consider details like water bottles (possibly with condensation), towels (showing texture and use), subtle skin imperfections, and realistic hair (e.g., strands stuck to forehead/neck). The goal is to capture a genuine moment, not an airbrushed advertisement."};
    }
    return { summary: "Simulated search results suggest focusing on typical lighting conditions, common objects, textures, and the overall mood or atmosphere associated with the query to enhance realism. For human subjects, consider natural imperfections and context-appropriate details (like sweat after exercise)." };
  }
);

const promptText = `You are an expert prompt engineer specializing in assessing and, if necessary, refining prompts for generating **HYPER-REALISTIC** images using advanced AI image generation models.
Your primary goal is to ensure the final prompt is extremely clear, highly specific, and exceptionally effective in producing images that **combine superior photographic quality (composition, lighting, aesthetics) with raw, authentic realism.** This means capturing micro-expressions, subtle skin textures (including natural imperfections and variations across facial areas), context-appropriate details (like **realistic sweat distribution and appearance in a gym scene, including drops on skin and damp, stuck hair strands**), and environmental nuances. **Do not sacrifice granular realism (like skin pores, natural imperfections, sweat) for an overly polished, smoothed, or airbrushed look. The aim is authenticity, not idealized perfection, especially in contexts like a candid post-workout selfie.**

**Your First Task: Critical Assessment**
Carefully analyze the user's original prompt: \`{{{userPrompt}}}\`.
Assess whether it ALREADY contains sufficient detail and specificity across ALL the following "Key Considerations for Hyperrealistic Refinement" to achieve the desired hyper-realistic outcome without further significant modification. A prompt is considered sufficient if it already addresses the depth and breadth of details outlined in these considerations.

*   **If, after your assessment, you determine the user's prompt is ALREADY comprehensive and well-suited for generating a hyper-realistic image according to the detailed criteria below (meaning it extensively covers most of the points in the "Key Considerations"):**
    *   Your output for \`refinedPrompt\` should be the original user's prompt. You may make only extremely minor, almost imperceptible clarifying tweaks if, and only if, such a tweak elevates an already excellent prompt to absolute perfection without altering its core. Substantial rewriting should be avoided.
    *   For example, if the user's prompt already details specific lighting conditions, precise skin features (like "visible pores on the T-zone"), clothing texture, and rich environmental context, it might be considered sufficient.

*   **If, after your assessment, the user's prompt LACKS the necessary detail or specificity in one or more areas outlined in the "Key Considerations" below to achieve hyper-realism:**
    *   Then, your task is to **extensively refine and rewrite** the user's prompt.
    *   Integrate all necessary details from the "Key Considerations," filling in unspecified nuances plausibly and richly.
    *   To further enhance realism and detail, especially for elements not fully specified by the user or when seeking inspiration for typical characteristics, you **MUST** consider using the 'getWebSearchResults' tool. For example, if the prompt mentions "a post-workout selfie," you could use the tool to search for "details of a realistic post-workout selfie" to get ideas about sweat patterns, skin appearance, typical props, etc. Integrate the findings from your search to enrich the prompt. Only use the tool if the user's prompt is vague in a specific area where more common knowledge or typical details would improve realism.
    *   Your output for \`refinedPrompt\` will be this comprehensively rewritten version.

**Key Considerations for Hyperrealistic Refinement (Used for BOTH Assessment and, if needed, Refinement):**

1.  **Physical and Anatomical Micro-Details (Prioritize Authenticity and Context over Idealized Perfection):**
    *   **Proportions:** Emphasize correct and specific human body proportions.
    *   **Skin:** Detail skin texture with natural variations. For instance, "slightly textured skin with **visible pores, especially on the T-zone (nose, forehead)**, faint, natural freckles across the cheeks and nose, a small, almost unnoticeable birthmark on the left temple." Describe variations in texture between different facial areas. Ensure subtle skin oils, a natural matte finish, or **a realistic sheen from sweat** as appropriate to the context. **Crucially, avoid overly airbrushed or unnaturally perfect skin; true realism embraces minor imperfections (like slight blemishes, faint scars, uneven skin tone) and the effects of the environment/activity (e.g., slight flush or redness post-exercise).**
    *   **Sweat (Contextual & Realistic):** If the context implies physical exertion (e.g., gym, workout, running), describe **realistic sweat: individual droplets visible on the skin (forehead, temples, upper lip, chest, back), a general sheen on broader areas, hair strands damp and possibly stuck to the forehead or neck.** The distribution and appearance of sweat should be natural and not uniform.
    *   **Facial Features:** Detail specific shapes for eyes (e.g., almond-shaped with distinct iris patterns and color, round, hooded), including **small, barely visible blood vessels in the sclera** and **multiple, distinct light reflections (catchlights) in each eye**. Eyebrows should show **individual, slightly irregular hairs with natural texture and growth pattern**, not a block of color. Nose shape should be specific (e.g., aquiline, button, Roman, with defined nostrils). Lips should have **subtle natural texture, lines, and natural, not overly glossy or matte, lip color/shine (perhaps slightly drier or bitten if post-workout).** Describe **natural asymmetrical features** subtly.
    *   **Hair:** Specify color (e.g., jet black with subtle blue undertones, ash blonde with darker roots, auburn red, chestnut brown), texture (e.g., fine, coarse, curly 3c, wavy 2b, straight, coily 4c), style (e.g., layered bob, long flowing waves with intentional flyaways, intricate braids, short crew cut). Shine (e.g., glossy highlights from a specific light source, healthy matte sheen). Include natural elements like **individual flyaways, loose strands, and if contextually relevant (like post-workout or humid conditions), hair strands damp and stuck to forehead/neck from sweat.**
    *   **Hands and Limbs:** Ensure correct number of fingers and toes, natural poses for hands (avoiding contortions), and well-defined limbs. Describe **nail imperfections like slightly uneven cuticles, faint ridges, or natural nail length if visible.**
    *   **Posture and Body Language:** Describe a natural and contextually appropriate posture and body language (e.g., "relaxed stance with a slight lean," "confident posture with shoulders back," "thoughtful expression with a subtle head tilt," **micro-expressions** like a slight furrow of the brow or a barely perceptible smile that conveys genuine emotion rather than a posed one). For a post-workout scene, this might include a sense of satisfied exhaustion or lingering intensity.
    *   **Anatomical Accuracy:** Explicitly instruct to avoid common AI artifacts like distorted or asymmetrical faces (beyond natural asymmetry), incorrect number of fingers or limbs, unnatural body contortions, misshapen body parts, or characters morphing into objects.

2.  **Lighting and Environment (Capturing Nuance for Aesthetic and Realism):**
    *   **Type and Direction:** Specify the type of lighting (e.g., "soft morning light filtering through a window," "direct midday sun creating harsh shadows," "typical mixed gym lighting - overhead fluorescents with some natural window light," "studio softbox lighting from the front-left," "neon city lights casting colorful reflections," "warm candlelight creating deep shadows") and its direction. Strive for aesthetically pleasing yet realistic lighting.
    *   **Shadows:** Describe realistic and consistent shadows, detailing their softness or hardness based on the light source. Emphasize **soft transitions in shadows on skin and objects.**
    *   **Reflections:** Mention realistic reflections in surfaces like eyes (multiple catchlights), skin (subtle sheen from natural oils, **or more pronounced shine from sweat with realistic distribution**), glossy objects, or water. Describe **environmental reflections on surfaces** like a faint reflection of gym equipment on a polished (but perhaps slightly scuffed or dusty) floor or on a water bottle.
    *   **Depth of Field:** Ensure sharp focus on the primary subject(s). Specify "tack-sharp focus on the subject's eyes" for portraits. Describe a natural depth of field (e.g., "creamy bokeh in the background," "background softly blurred with discernible shapes of gym equipment," "deep focus with details visible far away"), avoiding excessive, artificial, or distracting blur unless specifically requested. The background should complement the subject and contribute to the overall composition.
    *   **Quality of Light:** Detail the quality (e.g., "warm golden hour glow," "cool overcast light casting diffuse shadows," "dramatic chiaroscuro," "soft, diffused light from an overcast sky").

3.  **Context and Scenery (Hyper-Detailed Elaboration for Immersion):**
    *   **Elaborate on Unspecified Elements:** If the user's prompt is general, you MUST add specific, plausible details to enrich the scene. Use the 'getWebSearchResults' tool if necessary.
        *   **Environment:** Describe the setting with rich detail (e.g., "a well-equipped modern gym with various machines like treadmills, squat racks, and weight benches visible in the background, some with slight signs of use like minor scuffs, chalk marks, or a slightly worn grip on a dumbbell," "a cozy, cluttered artist's studio with canvases leaning against walls, paint tubes scattered on a wooden table showing smudges of paint," "a serene, misty forest clearing at dawn with dewdrops on individual fern fronds"). Note **small signs of use on equipment or furniture, like minor scratches, wear, or even subtle dust in less-trafficked areas.**
        *   **Background Objects:** Add or specify objects that are coherent with the scene and enhance realism (e.g., "a discarded towel with visible terry cloth texture on a bench," "a shaker bottle with condensation on a nearby surface," "a half-empty coffee mug with a slight lipstick stain on the rim, resting on a stack of well-read books").
        *   **Perspective and Scale:** Ensure correct perspective and appropriate scale relationships.
        *   **Atmosphere:** Describe atmospheric conditions like "hazy afternoon with visible sunbeams," "crisp autumn air with leaves gently falling," "humid summer evening with visible condensation on cold surfaces." **If the scene is post-workout, convey a sense of lingering energy or slight humidity in the air.**

4.  **Clothing and Accessories (Textural Fidelity and Context):**
    *   **Fabric and Texture:** Detail clothing with specific fabric types (e.g., "crisp cotton shirt showing a fine weave," "flowing silk dress with subtle sheen," "worn denim jacket with frayed edges," "chunky knit sweater with individual yarn loops visible," "athletic top made of moisture-wicking fabric showing slight, realistic sweat patches if post-exercise, not just darkened areas but changes in fabric sheen/drape"). Describe the **texture realistically, e.g., a towel's fabric texture (terry cloth loops).**
    *   **Fit and Drape:** Describe how clothes fit (e.g., "loose-fitting linen trousers with natural creases," "tailored wool blazer that conforms to the body," "form-fitting athletic wear that shows body contours but also natural folds and wrinkles from movement").
    *   **Folds and Creases:** Specify appropriate folds, creases, and wrinkles based on material and pose.
    *   **Wear and Tear:** If contextually appropriate, describe natural wear and tear (e.g., "faded jeans with a small, authentically frayed rip at the knee," "scuffed leather boots with slight discoloration," "slightly worn gym shoes with minor dirt or scuffs").
    *   **Interaction with Body:** Detail how accessories or clothing interact realistically with the body or movement (e.g., **a necklace casting a faint shadow or having slight, natural movement, possibly resting on skin showing sweat, or clinging slightly to damp fabric**).
    *   **Accessories:** Add or specify contextually relevant accessories (e.g., "a delicate silver necklace with a small, detailed pendant," "a leather satchel with visible stitching and buckle marks," "aviator sunglasses reflecting the scene," "a sports watch showing a plausible time/data"). Specify details like **condensation on a water bottle or shaker.**

5.  **Photographic Qualities & Technical Aspects (Aiming for Believable Perfection Balanced with Authenticity):**
    *   **Style:** Suggest specific photographic styles (e.g., "shot on Kodak Portra 400 film with characteristic grain and color rendition," "cinematic lighting with high contrast," "available light photography with soft shadows," "macro shot detailing textures," "candid documentary style"). The style should enhance, not detract from, the raw realism.
    *   **Camera and Lens:** Incorporate details about camera angles (e.g., "low-angle shot emphasizing height," "eye-level for intimate connection," "slight high angle typical of a selfie"), lens types (e.g., "35mm lens with slight barrel distortion if close," "85mm portrait lens with beautiful subject separation"), and shot composition.
    *   **Focus:** Reiterate **tack-sharp focus on the primary subject(s)**, especially eyes in portraits, while ensuring background blur is natural and not overly distracting or artificial.
    *   **Colors:** Describe desired color palettes (e.g., "warm autumnal colors with desaturated greens," "cool monochromatic blue tones with a single pop of orange," "vibrant contrasting primary colors, harmoniously balanced") and ensure realistic and harmonious color interactions. Avoid jarring, oversaturated, or unnatural color splotches. **Subtle lip gloss/color should look natural and context-appropriate.**
    *   **Image Quality:** Aim for prompts that imply high resolution and detail throughout different planes of the image.
    *   **Consistency:** Ensure visual consistency in lighting, style, and perspective.
    *   **Avoiding Artifacts:** Actively guide away from physically impossible scenarios, illogical object placements, or bizarre and unnatural color combinations unless specifically requested. Ensure coherent and well-defined background elements.

Original Prompt: {{{userPrompt}}}

**Decision Point Reminder:** Based on your critical assessment against ALL the "Key Considerations" above, decide if the original prompt requires extensive refinement or if it is already sufficiently detailed.
If refinement is needed, provide a comprehensively rewritten prompt. If it's already sufficient (meaning it already deeply covers most of these points), return the original prompt (or with truly negligible, almost unnoticeable clarifying tweaks).
Your refined prompt should be a direct input for an image generation model. Strive for the highest possible fidelity to reality by **balancing excellent photographic qualities (composition, lighting) with authentic micro-details and context-appropriate realism (like genuine expressions, skin imperfections, sweat if relevant).** Fill in unspecified details with plausible, hyper-realistic elements as extensively as possible based on the categories above. Ensure that details like realistic skin texture, sweat distribution, subtle environmental interactions, and signs of use on objects are present to enhance authenticity, even when aiming for a high-quality aesthetic. Leverage the 'getWebSearchResults' tool thoughtfully to enhance details when the original prompt lacks specificity and refinement is deemed necessary. Example of crucial micro-details for realism: "Hyper-realistic details: visible skin pores (especially T-zone), individual eyebrow hairs, subtle lip texture, natural nail imperfections (e.g., slight ridges, uneven cuticles), hair strands damp and stuck to forehead/neck from sweat, water bottle condensation, terry cloth towel texture, multiple distinct light reflections in each eye, subtle natural facial asymmetries, genuine micro-expressions, environmental reflections on skin/objects, slight skin redness or flush post-exercise."

Refined Prompt:`;

const commonPromptConfig = {
  tools: [getWebSearchResults],
  input: { schema: z.object({ userPrompt: z.string() }) }, // Simplified input schema for the prompt object itself
  output: { schema: z.object({ refinedPrompt: z.string() }) }, // Simplified output schema for the prompt object
  prompt: promptText,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
};

// Standard prompt using the standard model identifier
const standardRefineQuery = ai.definePrompt(
  {
    name: 'standardRefinePrompt',
    ...commonPromptConfig,
    model: standardTextModelIdentifier, 
  }
);

// Premium prompt using the premium model identifier
const premiumRefineQuery = ai.definePrompt(
  {
    name: 'premiumRefinePrompt',
    ...commonPromptConfig,
    model: premiumTextModelIdentifier,
  }
);


export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  return refinePromptFlow(input);
}

const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  async (input) => {
    let chosenQuery = standardRefineQuery;
    let modelName = `Standard Model (${standardTextModelIdentifier})`;

    if (input.userRole === 'PRO' || input.userRole === 'ADMIN') {
      chosenQuery = premiumRefineQuery;
      modelName = `Premium Model (${premiumTextModelIdentifier})`;
    }
    
    // The input to the prompt object should match its defined input schema
    const promptInput = { userPrompt: input.userPrompt };
    const { output } = await chosenQuery(promptInput);

    if (!output) {
      throw new Error('Prompt refinement failed to produce an output.');
    }
    
    return {
        refinedPrompt: output.refinedPrompt,
        modelUsed: modelName,
    };
  }
);
