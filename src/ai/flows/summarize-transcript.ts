'use server';

/**
 * @fileOverview Summarizes long transcripts of spoken text for teachers.
 *
 * - summarizeTranscript - A function that handles the transcript summarization process.
 */

import {ai} from '@/ai/genkit';
import { SummarizeTranscriptInput, SummarizeTranscriptInputSchema, SummarizeTranscriptOutput, SummarizeTranscriptOutputSchema } from '@/ai/schemas/summarizeTranscriptSchema';


export async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: {schema: SummarizeTranscriptInputSchema},
  output: {schema: SummarizeTranscriptOutputSchema},
  prompt: `You are an expert summarizer for college teachers.

  You will be provided with a transcript of spoken text, and you will generate a concise summary of the key points.

  Transcript: {{{transcript}}}`,
});

const summarizeTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeTranscriptFlow',
    inputSchema: SummarizeTranscriptInputSchema,
    outputSchema: SummarizeTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
