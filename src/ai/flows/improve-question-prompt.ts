'use server';

/**
 * @fileOverview An AI agent that refines a teacher's question with follow-up prompts for improved accuracy and context.
 *
 * - improveQuestion - A function that handles the question refinement process.
 */

import {ai} from '@/ai/genkit';
import { ImproveQuestionInput, ImproveQuestionInputSchema, ImproveQuestionOutput, ImproveQuestionOutputSchema } from '@/ai/schemas/improveQuestionSchema';


export async function improveQuestion(input: ImproveQuestionInput): Promise<ImproveQuestionOutput> {
  return improveQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveQuestionPrompt',
  input: {schema: ImproveQuestionInputSchema},
  output: {schema: ImproveQuestionOutputSchema},
  prompt: `You are Lumina, a friendly and helpful assistant for college teachers. A teacher has asked the following initial question: "{{question}}". The teacher has provided the following follow-up prompt to refine the question: "{{followUp}}".  Please combine the initial question and the follow-up prompt into a single, clear, and refined question. The refined question should incorporate the context from both the initial question and the follow-up prompt. Return only the refined question, do not include any other surrounding text.  The refined question is: `,
});

const improveQuestionFlow = ai.defineFlow(
  {
    name: 'improveQuestionFlow',
    inputSchema: ImproveQuestionInputSchema,
    outputSchema: ImproveQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
