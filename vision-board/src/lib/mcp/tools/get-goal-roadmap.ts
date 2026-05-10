import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSession } from "@/lib/db/queries/vision_sessions";

const TIMEFRAME_LABELS: Record<string, string> = {
  "3months": "3 个月",
  "6months": "6 个月",
  "1year": "1 年",
};

export function registerGetGoalRoadmap(server: McpServer, userId: string) {
  server.registerTool(
    "get_goal_roadmap",
    {
      description: "Get a structured goal roadmap with phases and milestones for a completed vision session.",
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

      const goals = Array.isArray(session.goals)
        ? (session.goals as { title: string; description: string; category: string; icon: string }[])
        : [];

      const timeframeLabel = TIMEFRAME_LABELS[session.timeframe ?? "6months"] ?? "6 个月";

      // Build phases
      const phases = goals.map((goal, i) => ({
        phase: i + 1,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        suggested_start: `第 ${i + 1} 阶段`,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              session_id: session.id,
              timeframe: timeframeLabel,
              total_goals: goals.length,
              roadmap_phases: phases,
              completion_vision: `在 ${timeframeLabel} 内，完成这 ${goals.length} 个目标，成为更好的自己。`,
            }, null, 2),
          },
        ],
      };
    }
  );
}
