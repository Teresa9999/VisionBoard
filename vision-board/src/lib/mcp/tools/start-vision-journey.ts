import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSession } from "@/lib/db/queries/vision_sessions";

export function registerStartVisionJourney(server: McpServer, userId: string) {
  server.registerTool(
    "start_vision_journey",
    {
      description: "Start a new vision board journey by recording the user's current emotional state.",
      inputSchema: {
        emotion: z
          .enum(["calm", "excited", "lost", "longing", "tired", "curious"])
          .describe("Current emotional state of the user"),
      },
    },
    async ({ emotion }) => {
      const session = await createSession(userId, emotion);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              session_id: session.id,
              emotion: session.emotion,
              status: session.status,
              created_at: session.createdAt,
              message: "Vision journey started. Proceed to swipe cards to collect preferences.",
            }, null, 2),
          },
        ],
      };
    }
  );
}
