import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getUserSessions } from "@/lib/db/queries/vision_sessions";

export function registerListVisionSessions(server: McpServer, userId: string) {
  server.registerTool(
    "list_vision_sessions",
    {
      description: "List all vision board sessions for the current user, ordered by most recent first.",
    },
    async () => {
      const sessions = await getUserSessions(userId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              sessions.map((s) => ({
                id: s.id,
                emotion: s.emotion,
                status: s.status,
                goals_count: Array.isArray(s.goals) ? (s.goals as unknown[]).length : 0,
                timeframe: s.timeframe,
                created_at: s.createdAt,
              })),
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
