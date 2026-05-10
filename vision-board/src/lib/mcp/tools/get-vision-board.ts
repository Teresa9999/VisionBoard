import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSession } from "@/lib/db/queries/vision_sessions";

export function registerGetVisionBoard(server: McpServer, userId: string) {
  server.registerTool(
    "get_vision_board",
    {
      description: "Get the completed vision board content including goals, summary, and timeframe for a session.",
      inputSchema: {
        session_id: z.number().int().positive().describe("The vision session ID"),
      },
    },
    async ({ session_id }) => {
      const session = await getSession(session_id);
      if (!session || session.userId !== userId) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Session ${session_id} not found.` }],
        };
      }
      if (session.status !== "completed") {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Session ${session_id} is not completed yet. Status: ${session.status}` }],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              session_id: session.id,
              emotion: session.emotion,
              summary: session.summary,
              user_supplement: session.userSupplement,
              goals: session.goals,
              timeframe: session.timeframe,
              liked_cards_count: Array.isArray(session.likedCards) ? session.likedCards.length : 0,
              created_at: session.createdAt,
            }, null, 2),
          },
        ],
      };
    }
  );
}
