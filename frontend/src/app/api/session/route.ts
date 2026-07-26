import { NextResponse } from 'next/server';

// Session API - stores session data in memory/sessionStorage
// Prisma/DB removed for Vercel deployment compatibility

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { company, jobRole, lpaCategory } = body;

    // Call python backend to generate dynamic roadmap
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/interview/generate-roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: company, job_role: jobRole, lpa_category: lpaCategory }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate roadmap from AI backend');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, session: { company, jobRole, lpaCategory, rounds: data.rounds } });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
