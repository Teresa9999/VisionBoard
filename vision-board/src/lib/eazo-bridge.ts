import { isLocalDemoMode } from "@/lib/local-demo";

type EazoAction = {
  content: string;
  event_type: string;
  page: string;
  metadata?: Record<string, unknown>;
};

export async function reportAction(action: EazoAction) {
  if (isLocalDemoMode()) return;

  try {
    const { memory } = await import("@eazo/sdk");
    await memory.reportAction(action);
  } catch {
    // Eazo memory is optional for the standalone local demo.
  }
}
