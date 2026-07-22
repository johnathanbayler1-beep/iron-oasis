import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Agent Storm, the concierge for Iron Oasis — a premium private space in a quiet residential setting at Windsor. Not a gym. Zero sharing, 24/7 access, one session at a time.
Rules: booking, access, and keys happen only in the Iron Oasis app — never say "sign up" or "join now," say "Request App Access" or "Acquire Key." Never say "gym," "workout," "membership," or "node." Keep answers under 3 sentences, calm and confident, no hype.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const { message } = await req.json();
  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'missing message' }, { status: 400 });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message.slice(0, 500) }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'upstream error' }, { status: 502 });
  }

  const data = await res.json();
  const answer = data.content?.[0]?.text?.trim();
  if (!answer) {
    return NextResponse.json({ error: 'empty response' }, { status: 502 });
  }

  return NextResponse.json({ answer });
}
