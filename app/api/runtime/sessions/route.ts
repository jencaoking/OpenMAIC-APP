import { NextRequest, NextResponse } from 'next/server';
import type { RuntimeSession, RuntimeSessionCreate } from '@openmaic/storage-types';
import { nanoid } from 'nanoid';

const sessions: Map<string, RuntimeSession> = new Map();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const payload: RuntimeSessionCreate = body;

    const now = new Date().toISOString();
    const sessionId = nanoid();

    const session: RuntimeSession = {
      id: sessionId,
      runtimeDslVersion: '1.0.0',
      kind: payload.kind,
      stageId: payload.stageId,
      learnerKey: payload.learnerKey,
      status: payload.status,
      createdAt: now,
      updatedAt: now,
    };

    sessions.set(sessionId, session);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const learnerKey = searchParams.get('learnerKey');

    let result: RuntimeSession[] = Array.from(sessions.values());

    if (stageId) {
      result = result.filter((s) => s.stageId === stageId);
    }
    if (learnerKey) {
      result = result.filter((s) => s.learnerKey === learnerKey);
    }

    result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}