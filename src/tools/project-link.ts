import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { z } from 'zod';
import * as deploymentsApi from '../api/deployments';
import { linkExists, resolveLink, writeLink } from '../state/project-link';
import { formatError, toolJson, toolResponse } from '../utils/error-formatter';

export function registerProjectLinkTools(server: McpServer) {
  server.tool(
    'project_link',
    'Bind the current directory (or a given path) to a Belmo deployment. ' +
      'Writes .hostingguru/project.json. In a monorepo, run once per service ' +
      'from each service directory. The link file is intended to be committed ' +
      'so teammates inherit the binding.',
    {
      deploymentId: z.string().describe('Deployment ID to link to.'),
      path: z
        .string()
        .optional()
        .describe('Directory to link. Defaults to the current working directory.'),
      force: z
        .boolean()
        .optional()
        .describe('Overwrite an existing link file. Defaults to false.'),
    },
    async ({ deploymentId, path, force }) => {
      try {
        const dir = resolve(path ?? process.cwd());
        if (!force && linkExists(dir)) {
          return toolResponse(
            `${dir}/.hostingguru/project.json already exists. ` +
              `Pass force=true to overwrite, or run project_status to inspect the current binding.`
          );
        }
        const deployment = await deploymentsApi.getDeployment(deploymentId);
        const file = writeLink(dir, {
          workspaceId: deployment.workspaceId,
          deploymentId: deployment.id,
          deploymentName: deployment.name,
          projectId: deployment.projectId,
          linkedAt: new Date().toISOString(),
        });
        return toolResponse(
          `Linked ${dir} → deployment "${deployment.name}" (${deployment.id}).\n` +
            `Wrote ${file}. Commit this file so teammates pick up the same binding.`
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'project_status',
    'Show which Belmo deployment is linked to the current directory ' +
      '(or a given path). Use this before running env_pull or logs_fetch ' +
      'so you know which service you are operating on.',
    {
      path: z.string().optional().describe('Directory to inspect. Defaults to cwd.'),
    },
    async ({ path }) => {
      try {
        const { link, root } = resolveLink(path ?? process.cwd());
        return toolJson(
          { linkRoot: root, ...link },
          'Linked deployment:'
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'env_pull',
    'Pull environment variables from the linked deployment and write them to ' +
      'a local .env file. Resolves the link from .hostingguru/project.json by ' +
      'walking up from cwd (or the given path).',
    {
      path: z.string().optional().describe('Directory to operate from. Defaults to cwd.'),
      filename: z
        .string()
        .optional()
        .describe('Output filename. Defaults to .env.local.'),
      overwrite: z
        .boolean()
        .optional()
        .describe('Overwrite the file if it exists. Defaults to true.'),
    },
    async ({ path, filename, overwrite }) => {
      try {
        const { link, root } = resolveLink(path ?? process.cwd());
        const vars = await deploymentsApi.listEnvVars(link.deploymentId);
        const lines = (Array.isArray(vars) ? vars : []).map(
          (v: { key: string; value: string }) =>
            `${v.key}=${escapeEnvValue(v.value ?? '')}`
        );
        const target = join(root, filename ?? '.env.local');
        if (!overwrite && existsSyncSafe(target)) {
          return toolResponse(
            `${target} already exists. Pass overwrite=true to replace it.`
          );
        }
        writeFileSync(target, lines.join('\n') + '\n', 'utf8');
        return toolResponse(
          `Wrote ${lines.length} variable${lines.length === 1 ? '' : 's'} ` +
            `from "${link.deploymentName}" to ${target}.`
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'logs_fetch',
    'Fetch recent logs for the linked deployment. Resolves the link from ' +
      '.hostingguru/project.json by walking up from cwd (or the given path). ' +
      'For build-specific logs, pass buildId. For incremental tailing, pass ' +
      'since (ISO timestamp).',
    {
      path: z.string().optional().describe('Directory to operate from. Defaults to cwd.'),
      buildId: z
        .string()
        .optional()
        .describe('If set, fetch logs for a specific build instead of runtime logs.'),
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Maximum number of log lines to return (runtime logs only).'),
      since: z
        .string()
        .optional()
        .describe('ISO-8601 timestamp; only return lines newer than this (runtime logs only).'),
    },
    async ({ path, buildId, limit, since }) => {
      try {
        const { link } = resolveLink(path ?? process.cwd());
        const data = buildId
          ? await deploymentsApi.getBuildLogs(link.deploymentId, buildId)
          : await deploymentsApi.getLogs(link.deploymentId, { limit, since });
        return toolJson(
          data,
          `Logs for "${link.deploymentName}"${buildId ? ` (build ${buildId})` : ''}:`
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}

function escapeEnvValue(v: string): string {
  if (/[\s"'$`\\#=]/.test(v) || v === '') {
    return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return v;
}

function existsSyncSafe(p: string): boolean {
  try {
    return require('fs').existsSync(p);
  } catch {
    return false;
  }
}
