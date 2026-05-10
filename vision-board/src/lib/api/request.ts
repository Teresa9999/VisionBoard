import { isLocalDemoMode } from "@/lib/local-demo";

/**
 * Drop-in replacement for `fetch` that automatically injects `x-eazo-session`.
 * The SDK resolves the current session header from either the host bridge
 * (Eazo Mobile) or localStorage (web).
 */
export async function request(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (isLocalDemoMode()) {
    return fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  }

  const { auth } = await import("@eazo/sdk");
  const sessionHeader = await auth.getSessionHeader();

  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      ...(sessionHeader ? { "x-eazo-session": sessionHeader } : {}),
    },
  });
}
