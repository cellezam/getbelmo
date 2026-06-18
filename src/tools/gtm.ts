import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as gtmApi from '../api/gtm';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

/**
 * The post-provision checklist the user follows in Google Tag Manager admin.
 * Both URLs are managed by the platform; the user only has to point GTM (and
 * their site) at them.
 */
function gtmSetupInstructions(taggingFqdn: string, previewFqdn: string): string {
  const taggingUrl = `https://${taggingFqdn}`;
  const previewUrl = `https://${previewFqdn}`;
  return [
    `Tagging server URL (production):  ${taggingUrl}`,
    `Preview server URL (debugging):  ${previewUrl}`,
    '',
    'Both servers are provisioning now (first build can take a few minutes).',
    `Check readiness with get_gtm_server, or open ${taggingUrl}/healthz — it returns "ok" once live.`,
    '',
    'Next, finish setup in Google Tag Manager (tagmanager.google.com):',
    `  1. Open your server container → Admin → Container Settings.`,
    `  2. Under "Server container URLs", add:  ${taggingUrl}  — then Save.`,
    `  3. Point your data at the server: in your GA4 Configuration / gtag, set the`,
    `     server_container_url (transport_url) to  ${taggingUrl}.`,
    `  4. Debugging: click Preview in GTM — requests fire through the preview server`,
    `     (${previewUrl}), which is already wired to your tagging server. No extra config.`,
    '',
    'Custom domains: attach your own domain to either URL later from the Domains page —',
    'the tagging and preview servers can each take their own.',
  ].join('\n');
}

export function registerGtmTools(server: McpServer) {
  server.tool(
    'setup_gtm_server',
    'Provision a managed server-side Google Tag Manager instance (tagging + preview servers). ' +
      'Requires the Pro or Custom plan. Returns the working URLs and the steps to finish setup ' +
      'in Google Tag Manager. Ask the user for their GTM "Container Config" string first — it is ' +
      'found in GTM admin → server container → "Manually provision tagging server".',
    {
      name: z.string().describe('A name for this GTM server (e.g. "production-gtm")'),
      containerConfig: z
        .string()
        .describe('The Container Config string from GTM admin → "Manually provision tagging server"'),
    },
    async ({ name, containerConfig }) => {
      try {
        const result = await gtmApi.createGtmService({ name, containerConfig });
        return toolResponse(
          `GTM server "${name}" is being provisioned.\n\n` +
            gtmSetupInstructions(result.taggingFqdn, result.previewFqdn) +
            `\n\nService id: ${result.gtmServiceId}`
        );
      } catch (error) {
        const msg = formatError(error);
        if (msg.includes('GTM_NOT_AVAILABLE')) {
          return toolResponse(
            'Server-side GTM requires the Pro or Custom plan. Upgrade the workspace, then try again.'
          );
        }
        if (msg.includes('GTM_SERVICE_NAME_TAKEN')) {
          return toolResponse(`A GTM server named "${name}" already exists in this workspace. Pick another name.`);
        }
        if (msg.includes('GTM_SERVICE_LIMIT_EXCEEDED')) {
          return toolResponse('This workspace already has the maximum of 2 GTM servers. Delete one first with delete_gtm_server.');
        }
        return toolResponse(msg);
      }
    }
  );

  server.tool(
    'list_gtm_servers',
    'List the managed GTM server-side instances in the current workspace.',
    {},
    async () => {
      try {
        const data = await gtmApi.listGtmServices();
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No GTM servers yet. Use setup_gtm_server to create one.');
        }
        return toolJson(data, 'GTM servers:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'get_gtm_server',
    'Get a GTM server: status, the URLs, and the Google Tag Manager setup steps.',
    { gtmServiceId: z.string() },
    async ({ gtmServiceId }) => {
      try {
        const data = await gtmApi.getGtmService(gtmServiceId);
        const header =
          `Name: ${data.name}\n` +
          `Status: ${data.status}\n\n` +
          gtmSetupInstructions(data.taggingFqdn, data.previewFqdn);
        return toolJson(data, header);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'update_gtm_container_config',
    'Replace the GTM Container Config string and redeploy both servers.',
    {
      gtmServiceId: z.string(),
      containerConfig: z.string().describe('The new Container Config string from GTM admin'),
    },
    async ({ gtmServiceId, containerConfig }) => {
      try {
        await gtmApi.updateGtmContainerConfig(gtmServiceId, containerConfig);
        return toolResponse('Container config updated. Both servers are redeploying.');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'redeploy_gtm_server',
    'Redeploy both the tagging and preview servers for a GTM service.',
    { gtmServiceId: z.string() },
    async ({ gtmServiceId }) => {
      try {
        await gtmApi.redeployGtmService(gtmServiceId);
        return toolResponse('Redeploy triggered for both servers. Use get_gtm_server to track status.');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'delete_gtm_server',
    'Delete a GTM server and tear down both its tagging and preview containers.',
    { gtmServiceId: z.string() },
    async ({ gtmServiceId }) => {
      try {
        await gtmApi.deleteGtmService(gtmServiceId);
        return toolResponse('GTM server deleted (both containers torn down).');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
