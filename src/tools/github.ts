import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as githubApi from '../api/github';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

export function registerGitHubTools(server: McpServer) {
  server.tool(
    'connect_github',
    'Connect a GitHub account to the selected workspace. Returns the Belmo GitHub App install URL to open in your browser; the connection completes automatically once you approve, after which you can use list_repositories.',
    {},
    async () => {
      try {
        const { installUrl } = await githubApi.getInstallUrl();
        return toolResponse(
          'To connect GitHub, open this URL in your browser and install the Belmo GitHub App:\n\n' +
          installUrl + '\n\n' +
          'The connection completes automatically once you approve the installation. ' +
          'Then run list_repositories to see your repos.'
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'list_repositories',
    'List GitHub repositories available for deployment.',
    {},
    async () => {
      try {
        const data = await githubApi.listRepositories();
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No repositories found. Connect GitHub first with connect_github.');
        }
        return toolJson(data, 'Available repositories:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'list_branches',
    'List branches for a GitHub repository.',
    { repositoryId: z.string() },
    async ({ repositoryId }) => {
      try {
        const data = await githubApi.listBranches(repositoryId);
        return toolJson(data, 'Branches:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
