import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerStartVisionJourney } from "./tools/start-vision-journey";
import { registerGetVisionSession } from "./tools/get-vision-session";
import { registerGetVisionBoard } from "./tools/get-vision-board";
import { registerListVisionSessions } from "./tools/list-vision-sessions";
import { registerGetGoalRoadmap } from "./tools/get-goal-roadmap";

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: "vision-board",
    version: "1.0.0",
  });

  registerStartVisionJourney(server, userId);
  registerGetVisionSession(server, userId);
  registerGetVisionBoard(server, userId);
  registerListVisionSessions(server, userId);
  registerGetGoalRoadmap(server, userId);

  return server;
}
