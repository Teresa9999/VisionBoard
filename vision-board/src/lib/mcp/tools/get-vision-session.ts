import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSession } from "@/lib/db/queries/vision_sessions";

export function registerGetVisionSession(server: McpServer, userId: string) {
  server.registerTool(
    "get_vision_session",
    {
      description: "Get details of a specific vision session by ID.",
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
      return {
        content: [{ type: "text" as const, text: JSON.stringify(session, null, 2) }],
      };
    }
  );
}
