import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CONFIG } from './config';
import { loadCredentials } from './state/credentials';
import { registerAuthTools } from './tools/auth';
import { registerWorkspaceTools } from './tools/workspaces';
import { registerGitHubTools } from './tools/github';
import { registerDeploymentTools } from './tools/deployments';
import { registerEnvTools } from './tools/env';
import { registerBillingTools } from './tools/billing';
import { registerDomainTools } from './tools/domains';
import { registerProjectTools } from './tools/projects';
import { registerProjectLinkTools } from './tools/project-link';
import { registerGtmTools } from './tools/gtm';

async function main() {
  // Restore session from disk
  loadCredentials();

  const server = new McpServer({
    name: 'belmo',
    version: CONFIG.version,
  });

  // Register all tools
  registerAuthTools(server);
  registerWorkspaceTools(server);
  registerGitHubTools(server);
  registerDeploymentTools(server);
  registerEnvTools(server);
  registerBillingTools(server);
  registerDomainTools(server);
  registerProjectTools(server);
  registerProjectLinkTools(server);
  registerGtmTools(server);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
