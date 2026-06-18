import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as projectsApi from '../api/projects';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

export function registerProjectTools(server: McpServer) {
  server.tool(
    'create_project',
    'Create a project to group deployments.',
    { name: z.string().min(1) },
    async ({ name }) => {
      try {
        const data = await projectsApi.createProject(name);
        return toolJson(data, 'Project created.');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'list_projects',
    'List all projects in the workspace.',
    {},
    async () => {
      try {
        const data = await projectsApi.listProjects();
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No projects found. Use create_project to create one.');
        }
        return toolJson(data, 'Projects:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
