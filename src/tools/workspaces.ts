import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as workspacesApi from '../api/workspaces';
import { session } from '../state/session';
import { saveCredentials } from '../state/credentials';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

export function registerWorkspaceTools(server: McpServer) {
  server.tool(
    'list_workspaces',
    'List all workspaces you belong to.',
    {},
    async () => {
      try {
        const data = await workspacesApi.listWorkspaces();
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No workspaces found. Create one with create_workspace.');
        }
        return toolJson(data, 'Your workspaces:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'create_workspace',
    'Create a new workspace and auto-select it.',
    { name: z.string().min(1), slug: z.string().optional() },
    async ({ name, slug }) => {
      try {
        const data = await workspacesApi.createWorkspace(name, slug);
        session.setWorkspace(data.id);
        saveCredentials();
        return toolJson(data, `Workspace created and selected.`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'select_workspace',
    'Select an active workspace by ID. All subsequent operations use this workspace.',
    { workspaceId: z.string().uuid() },
    async ({ workspaceId }) => {
      try {
        session.setWorkspace(workspaceId);
        saveCredentials();
        return toolResponse(`Workspace selected: ${workspaceId}`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
