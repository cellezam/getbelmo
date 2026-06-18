import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as deploymentsApi from '../api/deployments';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

export function registerEnvTools(server: McpServer) {
  server.tool(
    'set_env_vars',
    'Set environment variables on a deployment. Replaces all existing vars.',
    {
      deploymentId: z.string(),
      variables: z.record(z.string(), z.string()).describe('Key-value pairs of environment variables'),
      isSecret: z.boolean().optional().describe('Mark variables as secret (default: false)'),
    },
    async ({ deploymentId, variables, isSecret }) => {
      try {
        await deploymentsApi.setEnvVars(deploymentId, variables, isSecret);
        const count = Object.keys(variables).length;
        return toolResponse(`${count} environment variable${count !== 1 ? 's' : ''} set.`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'list_env_vars',
    'List environment variables for a deployment (values may be masked).',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        const data = await deploymentsApi.listEnvVars(deploymentId);
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No environment variables set.');
        }
        return toolJson(data, 'Environment variables:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'delete_env_var',
    'Delete an environment variable by key.',
    { deploymentId: z.string(), key: z.string() },
    async ({ deploymentId, key }) => {
      try {
        await deploymentsApi.deleteEnvVar(deploymentId, key);
        return toolResponse(`Environment variable "${key}" deleted.`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
