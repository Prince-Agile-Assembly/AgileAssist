import { z } from 'zod';

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  languageCode: z.string().describe('The language code for the TTS voice (e.g., en-US, hi-IN).'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The base64 encoded audio data URI (e.g., data:audio/wav;base64,...).'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
