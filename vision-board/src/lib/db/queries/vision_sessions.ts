import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { visionSessions } from "../schema/vision_sessions";
import type { VisionSession } from "../schema/vision_sessions";
import { isLocalDemoMode } from "@/lib/local-demo";

type LocalSessionStore = {
  nextId: number;
  sessions: VisionSession[];
};

const globalWithVisionSessions = globalThis as typeof globalThis & {
  __visionBoardLocalSessions?: LocalSessionStore;
};

function getLocalStore() {
  globalWithVisionSessions.__visionBoardLocalSessions ??= {
    nextId: 1,
    sessions: [],
  };
  return globalWithVisionSessions.__visionBoardLocalSessions;
}

export async function createSession(userId: string, emotion: string): Promise<VisionSession> {
  if (isLocalDemoMode()) {
    const store = getLocalStore();
    const now = new Date();
    const session: VisionSession = {
      id: store.nextId++,
      userId,
      emotion,
      likedCards: [],
      skippedCards: [],
      summary: null,
      userSupplement: null,
      goals: [],
      timeframe: null,
      status: "in_progress",
      createdAt: now,
      updatedAt: now,
    };
    store.sessions.unshift(session);
    return session;
  }

  const rows = await db
    .insert(visionSessions)
    .values({ userId, emotion })
    .returning();
  return rows[0];
}

export async function getSession(id: number): Promise<VisionSession | undefined> {
  if (isLocalDemoMode()) {
    return getLocalStore().sessions.find((session) => session.id === id);
  }

  const rows = await db
    .select()
    .from(visionSessions)
    .where(eq(visionSessions.id, id));
  return rows[0];
}

export async function updateSession(
  id: number,
  data: Partial<Omit<VisionSession, "id" | "userId" | "createdAt">>
): Promise<VisionSession | undefined> {
  if (isLocalDemoMode()) {
    const store = getLocalStore();
    const index = store.sessions.findIndex((session) => session.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...store.sessions[index],
      ...data,
      updatedAt: new Date(),
    };
    store.sessions[index] = updated;
    return updated;
  }

  const rows = await db
    .update(visionSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(visionSessions.id, id))
    .returning();
  return rows[0];
}

export async function getUserSessions(userId: string): Promise<VisionSession[]> {
  if (isLocalDemoMode()) {
    return getLocalStore().sessions.filter((session) => session.userId === userId);
  }

  return db
    .select()
    .from(visionSessions)
    .where(eq(visionSessions.userId, userId))
    .orderBy(desc(visionSessions.createdAt));
}

export async function getLatestCompletedSession(userId: string): Promise<VisionSession | undefined> {
  if (isLocalDemoMode()) {
    return getLocalStore().sessions.find((session) => session.userId === userId);
  }

  const rows = await db
    .select()
    .from(visionSessions)
    .where(eq(visionSessions.userId, userId))
    .orderBy(desc(visionSessions.createdAt))
    .limit(1);
  return rows[0];
}
