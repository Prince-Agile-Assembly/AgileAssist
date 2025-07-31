import {z} from 'genkit';

/**
 * @fileOverview Schemas for the summarize-transcript flow.
 *
 * - SummarizeTranscriptInput - The input type for the summarizeTranscript function.
 * - SummarizeTranscriptOutput - The return type for the summarizeTranscript function.
 */

export const SummarizeTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The full transcript of the spoken text to summarize.'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

export const SummarizeTranscriptOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the provided transcript.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;
