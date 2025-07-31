import { ai } from '@/ai/genkit';
import { AnswerQuestionInput, AnswerQuestionInputSchema, AnswerQuestionOutput, AnswerQuestionOutputSchema } from '@/ai/schemas/answerQuestionSchema';


export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  prompt: `You are Lumina, a friendly and helpful assistant for college teachers. Answer concisely and clearly.

  Question: {{{question}}}`,
});

const answerQuestionFlow = ai.defineFlow(
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
