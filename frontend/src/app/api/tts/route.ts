import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const ELEVENLABS_API_KEY = "c7ecff1404064faa93079521e5d504aa"; 
    // Using 'Rachel' voice - professional female voice
    const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; 

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs Error:", err);
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
