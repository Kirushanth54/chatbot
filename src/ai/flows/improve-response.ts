'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving chatbot responses based on user feedback.
 *
 * - improveResponse - A function that takes user feedback and updates the chatbot's dataset to improve future responses.
 * - ImproveResponseInput - The input type for the improveResponse function, including the query, current response, and user feedback.
 * - ImproveResponseOutput - The return type for the improveResponse function, indicating whether the update was successful.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImproveResponseInputSchema = z.object({
  query: z.string().describe('The user query that triggered the response.'),
  currentResponse: z.string().describe('The current response provided by the chatbot.'),
  feedback: z.string().describe('User feedback on the current response (e.g., helpful, not helpful, needs improvement).'),
});
export type ImproveResponseInput = z.infer<typeof ImproveResponseInputSchema>;

const ImproveResponseOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the chatbot dataset was successfully updated.'),
});
export type ImproveResponseOutput = z.infer<typeof ImproveResponseOutputSchema>;

export async function improveResponse(input: ImproveResponseInput): Promise<ImproveResponseOutput> {
  return improveResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveResponsePrompt',
  input: {
    schema: z.object({
      query: z.string().describe('The user query that triggered the response.'),
      currentResponse: z.string().describe('The current response provided by the chatbot.'),
      feedback: z.string().describe('User feedback on the current response (e.g., helpful, not helpful, needs improvement).'),
    }),
  },
  output: {
    schema: z.object({
      success: z.boolean().describe('Indicates whether the chatbot dataset was successfully updated.'),
    }),
  },
  prompt: `You are an AI assistant that improves chatbot responses based on user feedback.

  You will receive the user's query, the current chatbot response, and the user's feedback on that response.
  Your task is to analyze the feedback and determine if the current response should be updated or improved in the dataset.

  If the feedback indicates that the response was not helpful or needs improvement, suggest a better response based on the user's query and feedback.
  If the feedback indicates that the response was helpful, confirm that the response is adequate.

  Here is the information:
  User Query: {{{query}}}
  Current Response: {{{currentResponse}}}
  User Feedback: {{{feedback}}}

  Based on this, determine whether the chatbot dataset needs to be updated. Return true if it does, false otherwise.
  `,
});

const improveResponseFlow = ai.defineFlow<
  typeof ImproveResponseInputSchema,
  typeof ImproveResponseOutputSchema
>({
  name: 'improveResponseFlow',
  inputSchema: ImproveResponseInputSchema,
  outputSchema: ImproveResponseOutputSchema,
},
async input => {
  // In a real implementation, you would update the chatbot's dataset here.
  // This is a placeholder to demonstrate the flow.
  console.log("Improve Response Flow");
  console.log("Input: ", input);

  // Call prompt to determine if the chatbot dataset needs to be updated.
    const { output } = await prompt(input);

    // In a real implementation, you would use the prompt's output to update the dataset.
    // For now, we just return the prompt's success value.
    return { success: output?.success ?? false };
});
