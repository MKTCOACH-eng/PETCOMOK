import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Login is handled by NextAuth, this route is just for compatibility
  return NextResponse.json(
    { message: 'Use /api/auth/signin for authentication' },
    { status: 200 }
  );
}
