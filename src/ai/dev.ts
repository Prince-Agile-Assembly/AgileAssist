import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-transcript.ts';
import '@/ai/flows/improve-question-prompt.ts';
import '@/ai/flows/answerQuestion.ts';
import '@/ai/flows/textToSpeech.ts';
