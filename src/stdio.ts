import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./goose-team.ts";

// Create the STDIO server
const { server } = createServer();

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GooseTeam MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});


process.on('SIGINT', () => {
  console.error("SIGINT")
  process.exit()
})

process.on('SIGTERM', () => {
  console.error("SIGTERM")
  process.exit()
})

process.on('SIGHUP', () => {
  console.error("SIGHUP")
  process.exit()
})
