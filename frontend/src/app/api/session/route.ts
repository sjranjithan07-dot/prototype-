import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { company, jobRole, lpaCategory, userId } = body;

    // Call python backend to generate dynamic roadmap
    const response = await fetch('http://localhost:8000/api/interview/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: company, job_role: jobRole, lpa_category: lpaCategory }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate roadmap from AI backend');
    }

    const data = await response.json();
    const rounds = data.rounds;

    // Create session and rounds in SQLite via Prisma
    // Assuming a hardcoded userId for now since auth isn't fully implemented
    const mockUserId = userId || "user_mock_123";

    // Ensure mock user exists
    await prisma.user.upsert({
      where: { email: "mock@example.com" },
      update: {},
      create: {
        id: mockUserId,
        email: "mock@example.com",
        name: "Test User"
      }
    });

    const session = await prisma.interviewSession.create({
      data: {
        userId: mockUserId,
        company,
        jobRole,
        lpaCategory,
        rounds: {
          create: rounds.map((r: any, index: number) => ({
            roundNumber: r.roundNumber || index + 1,
            roundName: r.roundName,
            roundType: r.roundType,
            description: r.description,
            status: index === 0 ? "ACTIVE" : "LOCKED", // Unlock first round
          }))
        }
      },
      include: { rounds: true }
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
