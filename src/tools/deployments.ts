import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as deploymentsApi from '../api/deployments';
import * as githubApi from '../api/github';
import { detectFramework } from '../utils/framework-detector';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

const VALID_FRAMEWORKS = ['node', 'nextjs', 'react', 'python', 'django', 'go', 'static'] as const;
const VALID_TYPES = ['api', 'static_site', 'worker', 'script'] as const;

export function registerDeploymentTools(server: McpServer) {
  server.tool(
    'deploy',
    'Deploy a repository. Fuzzy-matches repo name, auto-detects framework, applies smart defaults. The flagship deployment tool.',
    {
      repository: z.string().describe('Repository name or partial match'),
      branch: z.string().optional().describe('Branch to deploy (default: main/master)'),
      name: z.string().optional().describe('Deployment name'),
      type: z.enum(VALID_TYPES).optional().describe('Deployment type'),
      framework: z.enum(VALID_FRAMEWORKS).optional().describe('Framework'),
      buildCommand: z.string().optional(),
      startCommand: z.string().optional(),
      rootDirectory: z.string().optional(),
      publishDirectory: z.string().optional(),
      autoDeploy: z.boolean().optional().describe('Auto-deploy on push (default: true)'),
      envVars: z.record(z.string(), z.string()).optional().describe('Environment variables to set'),
    },
    async (params) => {
      try {
        // Fuzzy-match repository
        const repos = await githubApi.listRepositories();
        if (!Array.isArray(repos) || repos.length === 0) {
          return toolResponse('No repositories found. Connect GitHub first with connect_github.');
        }

        const query = params.repository.toLowerCase();
        let matched = repos.find((r: any) => r.fullName?.toLowerCase() === query || r.name?.toLowerCase() === query);
        if (!matched) {
          matched = repos.find((r: any) =>
            r.fullName?.toLowerCase().includes(query) || r.name?.toLowerCase().includes(query)
          );
        }
        if (!matched) {
          const repoNames = repos.map((r: any) => r.fullName || r.name).join('\n  ');
          return toolResponse(`Repository "${params.repository}" not found. Available:\n  ${repoNames}`);
        }

        // Auto-detect framework defaults
        const defaults = detectFramework(matched.name || '', matched.language);
        const deployParams: deploymentsApi.CreateDeploymentParams = {
          repositoryId: matched.id,
          repositoryFullName: matched.fullName || matched.name,
          branch: params.branch || matched.defaultBranch || 'main',
          name: params.name || matched.name,
          type: params.type || defaults.type,
          framework: params.framework || defaults.framework,
          buildCommand: params.buildCommand || defaults.buildCommand,
          startCommand: params.startCommand || defaults.startCommand,
          rootDirectory: params.rootDirectory,
          publishDirectory: params.publishDirectory,
          autoDeploy: params.autoDeploy ?? true,
        };

        const deployment = await deploymentsApi.createDeployment(deployParams);

        // Set env vars if provided
        if (params.envVars && Object.keys(params.envVars).length > 0) {
          try {
            await deploymentsApi.setEnvVars(deployment.id, params.envVars);
          } catch {
            // Non-fatal — deployment was created, env vars can be set later
          }
        }

        return toolJson(deployment,
          `Deployment created! Status: ${deployment.status || 'pending'}\n` +
          `Framework: ${deployParams.framework} | Type: ${deployParams.type}\n` +
          `Use get_deployment with id "${deployment.id}" to check progress.`
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'list_deployments',
    'List all deployments, optionally filtered by project.',
    { projectId: z.string().optional() },
    async ({ projectId }) => {
      try {
        const data = await deploymentsApi.listDeployments(projectId);
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No deployments found. Use deploy to create one.');
        }
        return toolJson(data, 'Deployments:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'get_deployment',
    'Get deployment details including status and live URL.',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        const data = await deploymentsApi.getDeployment(deploymentId);
        return toolJson(data);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'get_logs',
    'Get application logs for a deployment.',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        const data = await deploymentsApi.getLogs(deploymentId);
        if (typeof data === 'string') {
          return toolResponse(data || 'No logs available yet.');
        }
        return toolJson(data);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'list_builds',
    'List builds for a deployment.',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        const data = await deploymentsApi.listBuilds(deploymentId);
        if (Array.isArray(data) && data.length === 0) {
          return toolResponse('No builds found yet.');
        }
        return toolJson(data, 'Builds:');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'get_build_logs',
    'Get build/deploy logs for a specific build.',
    { deploymentId: z.string(), buildId: z.string() },
    async ({ deploymentId, buildId }) => {
      try {
        const data = await deploymentsApi.getBuildLogs(deploymentId, buildId);
        if (typeof data === 'string') {
          return toolResponse(data || 'No build logs available yet.');
        }
        return toolJson(data);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'redeploy',
    'Trigger a redeployment.',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        const data = await deploymentsApi.redeploy(deploymentId);
        return toolResponse(`Redeployment triggered. Use get_deployment to track progress.`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'rollback_deployment',
    'Rollback a deployment to a previous successful build commit. Use list_builds to find available commits.',
    {
      deploymentId: z.string(),
      commitSha: z.string().describe('The commit SHA to rollback to (from list_builds)'),
    },
    async ({ deploymentId, commitSha }) => {
      try {
        const data = await deploymentsApi.rollbackDeployment(deploymentId, commitSha);
        return toolResponse(`Rollback to ${commitSha.slice(0, 7)} triggered. Use get_deployment to track progress.`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'stop_deployment',
    'Stop a running deployment.',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        await deploymentsApi.stopDeployment(deploymentId);
        return toolResponse('Deployment stopped.');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'start_deployment',
    'Start a stopped deployment.',
    { deploymentId: z.string() },
    async ({ deploymentId }) => {
      try {
        await deploymentsApi.startDeployment(deploymentId);
        return toolResponse('Deployment started. Use get_deployment to track progress.');
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );
}
