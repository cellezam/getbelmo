import { getClient } from './client';

export interface CreateDeploymentParams {
  repositoryId: string;
  repositoryFullName: string;
  branch: string;
  name: string;
  type: string;
  framework: string;
  buildCommand?: string;
  startCommand?: string;
  rootDirectory?: string;
  publishDirectory?: string;
  autoDeploy?: boolean;
  projectId?: string;
}

export async function createDeployment(params: CreateDeploymentParams) {
  const res = await getClient().post('/deployments', params);
  return res.data;
}

export async function listDeployments(projectId?: string) {
  const params = projectId ? { projectId } : {};
  const res = await getClient().get('/deployments', { params });
  return res.data;
}

export async function getDeployment(id: string) {
  const res = await getClient().get(`/deployments/${id}`);
  return res.data;
}

export interface GetLogsOptions {
  limit?: number;
  since?: string;
}

export async function getLogs(id: string, options?: GetLogsOptions) {
  const params: Record<string, string | number> = {};
  if (options?.limit !== undefined) params.limit = options.limit;
  if (options?.since !== undefined) params.since = options.since;
  const res = await getClient().get(`/deployments/${id}/logs`, { params });
  return res.data;
}

export async function redeploy(id: string) {
  const res = await getClient().post(`/deployments/${id}/redeploy`);
  return res.data;
}

export async function stopDeployment(id: string) {
  const res = await getClient().post(`/deployments/${id}/stop`);
  return res.data;
}

export async function startDeployment(id: string) {
  const res = await getClient().post(`/deployments/${id}/start`);
  return res.data;
}

export async function setEnvVars(id: string, variables: Record<string, string>, isSecret?: boolean) {
  const payload = Object.entries(variables).map(([key, value]) => ({
    key,
    value,
    isSecret: isSecret ?? false,
  }));
  const res = await getClient().post(`/deployments/${id}/env/bulk`, { variables: payload });
  return res.data;
}

export async function listEnvVars(id: string) {
  const res = await getClient().get(`/deployments/${id}/env`);
  return res.data;
}

export async function listBuilds(id: string) {
  const res = await getClient().get(`/deployments/${id}/builds`);
  return res.data;
}

export async function getBuildLogs(id: string, buildId: string) {
  const res = await getClient().get(`/deployments/${id}/builds/${buildId}/logs`);
  return res.data;
}

export async function rollbackDeployment(id: string, commitSha: string) {
  const res = await getClient().post(`/deployments/${id}/rollback`, { commitSha });
  return res.data;
}

export async function deleteEnvVar(id: string, key: string) {
  const res = await getClient().delete(`/deployments/${id}/env/${key}`);
  return res.data;
}
