import { type NextRequest, NextResponse } from "next/server";
import { notifications, EazoNotificationPublishError } from "@eazo/sdk/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const callerLabel =
    auth.user.name?.trim() || auth.user.email?.split("@")[0] || "there";

  try {
    const result = await notifications.publish({
      title: `Hello, ${callerLabel} ✨`,
      body: "Your vision board is ready to explore!",
      data: {
        source: "test-button",
        triggeredByUserId: auth.user.id,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof EazoNotificationPublishError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.code >= 400 && err.code < 600 ? err.code : 500 }
      );
    }
    console.error("[notifications/test] unexpected error", err);
    return NextResponse.json({ error: "publish failed" }, { status: 500 });
  }
}
