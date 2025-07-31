import {z} from 'genkit';

/**
 * @fileOverview Schemas for the improve-question-prompt flow.
 *
 * - ImproveQuestionInput - The input type for the improveQuestion function.
 * - ImproveQuestionOutput - The return type for the improveQuestion function.
 */

export const ImproveQuestionInputSchema = z.object({
  question: z.string().describe('The teacher\'s initial question.'),
  followUp: z.string().describe('The teacher\'s follow-up prompt to refine the question.'),
});
export type ImproveQuestionInput = z.infer<typeof ImproveQuestionInputSchema>;

export const ImproveQuestionOutputSchema = z.object({
  refinedQuestion: z.string().describe('The refined question incorporating the follow-up prompt.'),
});
export type ImproveQuestionOutput = z.infer<typeof ImproveQuestionOutputSchema>;
