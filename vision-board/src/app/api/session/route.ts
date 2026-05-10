import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createSession, getSession, updateSession, getLatestCompletedSession } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const { id: userId } = auth.user;

  const body = await request.json();
  const { emotion } = body;
  if (!emotion) return NextResponse.json({ error: "emotion required" }, { status: 400 });

  const session = await createSession(userId, emotion);
  return NextResponse.json(session, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const { id: userId } = auth.user;

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (sessionId) {
    const session = await getSession(parseInt(sessionId));
    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  const latest = await getLatestCompletedSession(userId);
  return NextResponse.json(latest ?? null);
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const { id: userId } = auth.user;

  const body = await request.json();
  const { sessionId, ...data } = body;
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const session = await getSession(parseInt(sessionId));
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const updated = await updateSession(parseInt(sessionId), data);
  return NextResponse.json(updated);
}
