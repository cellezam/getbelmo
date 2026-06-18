import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as domainsApi from '../api/domains';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

export function registerDomainTools(server: McpServer) {
  server.tool(
    'attach_domain',
    'Attach a custom domain to a deployment. Returns DNS instructions.',
    { deploymentId: z.string(), domain: z.string() },
    async ({ deploymentId, domain }) => {
      try {
        const data = await domainsApi.attachDomain(deploymentId, domain);
        return toolJson(data,
          `Domain "${domain}" attached.\n\n` +
          'Next step: Add a CNAME record pointing to the provided target, then run verify_domain.'
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'verify_domain',
    'Verify DNS configuration for an attached domain.',
    { deploymentId: z.string(), domainId: z.string() },
    async ({ deploymentId, domainId }) => {
      try {
        const data = await domainsApi.verifyDomain(deploymentId, domainId);
        return toolJson(data, 'Domain verification result:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
