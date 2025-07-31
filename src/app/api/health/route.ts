// /src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.GEMINI_API_KEY) {
    return NextResponse.json({ status: 'ok' });
  } else {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable' }, { status: 500 });
  }
}
