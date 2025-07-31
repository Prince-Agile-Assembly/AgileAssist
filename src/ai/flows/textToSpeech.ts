'use server';

/**
 * @fileOverview Converts text to speech using a Genkit flow.
 *
 * - textToSpeech - A function that handles the text-to-speech conversion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TextToSpeechInput, TextToSpeechInputSchema, TextToSpeechOutput, TextToSpeechOutputSchema } from '@/ai/schemas/textToSpeechSchema';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, languageCode }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            languageCode: languageCode,
          },
        },
      },
      prompt: text,
    });

    if (!media?.url) {
      throw new Error('No audio data returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
