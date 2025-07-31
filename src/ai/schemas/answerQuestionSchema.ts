import { z } from 'zod';

export const AnswerQuestionInputSchema = z.object({
  question: z.string().describe("The user's question for the assistant."),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

export const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe("The assistant's answer to the question."),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;
