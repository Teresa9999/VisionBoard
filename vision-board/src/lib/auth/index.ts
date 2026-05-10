import { type NextRequest, NextResponse } from "next/server";
import { requireAuth as requireEazoAuth } from "@eazo/sdk/server";
import { isLocalDemoMode, LOCAL_DEMO_USER } from "@/lib/local-demo";

export type User = typeof LOCAL_DEMO_USER;
export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

export function requireAuth(request: NextRequest): AuthResult {
  if (isLocalDemoMode()) {
    return { ok: true, user: LOCAL_DEMO_USER };
  }

  return requireEazoAuth(request) as AuthResult;
}
