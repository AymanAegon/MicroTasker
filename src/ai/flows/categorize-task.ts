// The directive tells the Next.js runtime that the code should be executed on the server-side.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing tasks based on their descriptions.
 *
 * categorizeTaskByDescription - A function that categorizes a task based on its description.
 * CategorizeTaskInput - The input type for the categorizeTaskByDescription function.
 * CategorizeTaskOutput - The return type for the categorizeTaskByDescription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CategorizeTaskInputSchema = z.object({
  description: z.string().describe('The description of the task.'),
});
export type CategorizeTaskInput = z.infer<typeof CategorizeTaskInputSchema>;

const CategorizeTaskOutputSchema = z.object({
  category: z.string().describe('The predicted category of the task.'),
  confidence: z.number().describe('The confidence level of the category prediction (0-1).'),
});
export type CategorizeTaskOutput = z.infer<typeof CategorizeTaskOutputSchema>;

export async function categorizeTaskByDescription(input: CategorizeTaskInput): Promise<CategorizeTaskOutput> {
  return categorizeTaskFlow(input);
}

const categorizeTaskPrompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {
    schema: z.object({
      description: z.string().describe('The description of the task.'),
    }),
  },
  output: {
    schema: z.object({
      category: z.string().describe('The predicted category of the task.'),
      confidence: z.number().describe('The confidence level of the category prediction (0-1).'),
    }),
  },
  prompt: `You are a task categorization expert. Given the following task description, predict the most appropriate category for the task. Also, provide a confidence level (0-1) for your prediction.\n\nDescription: {{{description}}}\n\nRespond with the category and confidence level in JSON format.`,
});

const categorizeTaskFlow = ai.defineFlow<
  typeof CategorizeTaskInputSchema,
  typeof CategorizeTaskOutputSchema
>({
  name: 'categorizeTaskFlow',
  inputSchema: CategorizeTaskInputSchema,
  outputSchema: CategorizeTaskOutputSchema,
}, async input => {
  const {output} = await categorizeTaskPrompt(input);
  return output!;
});

