// /src/app/api/gen-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/ai/flows/answerQuestion';
import { textToSpeech } from '@/ai/flows/textToSpeech';

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    if (action === 'answerQuestion') {
      const result = await answerQuestion(payload);
      return NextResponse.json(result);
    }

    if (action === 'textToSpeech') {
      const result = await textToSpeech(payload);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}
