'use server';

import { ai } from '@/ai/genkit';
import { AnswerQuestionInput, AnswerQuestionInputSchema, AnswerQuestionOutput, AnswerQuestionOutputSchema } from '@/ai/schemas/answerQuestionSchema';

// This function is kept for potential non-streaming uses, but the flow is used directly for streaming.
export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  const { output } = await ai.runFlow(answerQuestionFlow, input);
  return output!;
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  prompt: `You are Lumina, a friendly and helpful assistant for college teachers. Answer concisely and clearly.

  Question: {{{question}}}`,
});

export const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
