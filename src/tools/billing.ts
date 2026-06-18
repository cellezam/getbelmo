import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as billingApi from '../api/billing';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

export function registerBillingTools(server: McpServer) {
  server.tool(
    'get_subscription',
    'Get current subscription plan, status, and usage limits.',
    {},
    async () => {
      try {
        const [subscription, usage] = await Promise.all([
          billingApi.getSubscription(),
          billingApi.getUsage(),
        ]);
        return toolJson({ subscription, usage }, 'Billing overview:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
