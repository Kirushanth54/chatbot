'use server';

/**
 * @fileOverview Summarizes chat history related to CVST for quick review.
 *
 * - summarizeChatHistory - A function that summarizes the chat history.
 * - SummarizeChatHistoryInput - The input type for the summarizeChatHistory function.
 * - SummarizeChatHistoryOutput - The return type for the summarizeChatHistory function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeChatHistoryInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The chat history between the doctor and patient.'),
});
export type SummarizeChatHistoryInput = z.infer<typeof SummarizeChatHistoryInputSchema>;

const SummarizeChatHistoryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise, medically relevant paragraph summarizing the chat history.'
    ),
});
export type SummarizeChatHistoryOutput = z.infer<typeof SummarizeChatHistoryOutputSchema>;

export async function summarizeChatHistory(
  input: SummarizeChatHistoryInput
): Promise<SummarizeChatHistoryOutput> {
  return summarizeChatHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatHistoryPrompt',
  input: {
    schema: z.object({
      chatHistory: z
        .string()
        .describe('The chat history between the doctor and patient.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z
        .string()
        .describe(
          'A concise, medically relevant paragraph summarizing the chat history.'
        ),
    }),
  },
  prompt: `You are an AI assistant specialized in summarizing medical conversations related to Cerebral Venous Sinus Thrombosis (CVST).

  Please summarize the following chat history between a doctor and a patient in a concise, medically relevant paragraph. Focus on key details relevant to CVST, such as symptoms, diagnosis, treatment options, and any specific concerns raised by the patient.  Omit any pleasantries or conversational filler.

  Chat History:
  {{chatHistory}}`,
});

const summarizeChatHistoryFlow = ai.defineFlow<
  typeof SummarizeChatHistoryInputSchema,
  typeof SummarizeChatHistoryOutputSchema
>({
  name: 'summarizeChatHistoryFlow',
  inputSchema: SummarizeChatHistoryInputSchema,
  outputSchema: SummarizeChatHistoryOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
