import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import {
  noArgSchema,
  addTaskSchema,
  agentWaitSchema,
  agentLeaveSchema,
  assignTaskSchema,
  addMessageSchema,
  completeTaskSchema,
} from "./common/schemas.ts";

import { VERSION } from "./common/version.ts";
import {
  registerAgent,
  listAgents,
  agentWait,
  agentLeave,
} from "./operations/agents.ts";
import {
  recentMessages,
  addMessage,
  listMessages,
  clearMessages,
} from "./operations/messages.ts";
import {
  addTask,
  listTasks,
  assignTask,
  completeTask,
} from "./operations/tasks.ts";

export const createServer = () => {
  // Instantiate the MCP server
  const server = new Server(
    {
      name: "goose-team",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register MCP request handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "register_agent",
          description: "Register a new agent",
          inputSchema: zodToJsonSchema(noArgSchema),
        },
        {
          name: "list_agents",
          description: "List all registered agents",
          inputSchema: zodToJsonSchema(noArgSchema),
        },
        {
          name: "agent_leave",
          description: "Allow an agent to leave the team",
          inputSchema: zodToJsonSchema(agentLeaveSchema),
        },
        {
          name: "agent_wait",
          description: "Wait for a specified number of seconds",
          inputSchema: zodToJsonSchema(agentWaitSchema),
        },
        {
          name: "add_message",
          description: "Add a new message",
          inputSchema: zodToJsonSchema(addMessageSchema),
        },
        {
          name: "recent_messages",
          description: "Retrieve recent messages",
          inputSchema: zodToJsonSchema(noArgSchema),
        },
        {
          name: "list_messages",
          description: "Retrieve all messages",
          inputSchema: zodToJsonSchema(noArgSchema),
        },
        {
          name: "clear_messages",
          description: "Clear all messages",
          inputSchema: zodToJsonSchema(noArgSchema),
        },
        {
          name: "add_task",
          description: "Add a new task",
          inputSchema: zodToJsonSchema(addTaskSchema),
        },
        {
          name: "assign_task",
          description: "Assign a task to an agent",
          inputSchema: zodToJsonSchema(assignTaskSchema),
        },
        {
          name: "list_tasks",
          description: "List all tasks",
          inputSchema: zodToJsonSchema(noArgSchema),
        },
        {
          name: "complete_task",
          description: "Complete a task",
          inputSchema: zodToJsonSchema(completeTaskSchema),
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      switch (request.params.name) {
        case "register_agent": {
          const result = registerAgent();
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }
        case "list_agents": {
          const result = listAgents();
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }
        case "agent_leave": {
          const args = agentLeaveSchema.parse(request.params.arguments);
          agentLeave(args.id);
          return {
            content: [{ type: "text", text: `Agent ${args.id} has left.` }],
          };
        }
        case "agent_wait": {
          const args = agentWaitSchema.parse(request.params.arguments);
          await agentWait(args.seconds);
          return {
            content: [
              { type: "text", text: `Waited for ${args.seconds} seconds.` },
            ],
          };
        }
        case "add_message": {
          const args = addMessageSchema.parse(request.params.arguments);
          const messageId = addMessage(args.senderId, args.content);
          return {
            content: [
              {
                type: "text",
                text: `Message ${messageId} added successfully.`,
              },
            ],
          };
        }
        case "recent_messages": {
          const result = recentMessages();
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }
        case "list_messages": {
          const result = listMessages();
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }
        case "clear_messages": {
          clearMessages();
          return {
            content: [
              { type: "text", text: `Message queue successfully cleared.` },
            ],
          };
        }
        case "add_task": {
          const args = addTaskSchema.parse(request.params.arguments);
          const { id } = addTask(args.description);
          return {
            content: [{ type: "text", text: `Task ${id} added successfully.` }],
          };
        }
        case "assign_task": {
          const args = assignTaskSchema.parse(request.params.arguments);
          assignTask({ ...args });
          return {
            content: [
              {
                type: "text",
                text: `Task ${args.taskId} assigned successfully to Agent ${args.agentId}.`,
              },
            ],
          };
        }
        case "list_tasks": {
          const allTasks = listTasks();
          return {
            content: [
              { type: "text", text: JSON.stringify(allTasks, null, 2) },
            ],
          };
        }
        case "complete_task": {
          const args = completeTaskSchema.parse(request.params.arguments);
          const taskId = args.taskId;
          completeTask(taskId);
          return {
            content: [
              { type: "text", text: `Task ${taskId} completed successfully.` },
            ],
          };
        }
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      throw new Error(
        `Error processing request: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  });

  return { server };
};
