// /src/app/api/gen-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/ai/flows/textToSpeech';
import { answerQuestionFlow } from '@/ai/flows/answerQuestion';
import { ai } from '@/ai/genkit';
import { StreamingTextResponse, Message } from 'ai';

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable' }, { status: 500 });
  }

  try {
    const { messages, action, payload } = await req.json();

    if (action === 'textToSpeech') {
      const result = await textToSpeech(payload);
      return NextResponse.json(result);
    }
    
    // Default action is streaming chat
    const lastUserMessage = messages[messages.length - 1];
    
    const stream = await ai.runFlow(answerQuestionFlow, {
      stream: true,
      input: { question: lastUserMessage.content },
    });
    
    const textStream = stream.text();
    return new StreamingTextResponse(textStream);

  } catch (error) {
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}
