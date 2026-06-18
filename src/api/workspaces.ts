import { getClient } from './client';

export async function listWorkspaces() {
  const res = await getClient().get('/workspaces');
  return res.data;
}

export async function createWorkspace(name: string, slug?: string) {
  const res = await getClient().post('/workspaces', { name, slug });
  return res.data;
}

export async function getWorkspace(id: string) {
  const res = await getClient().get(`/workspaces/${id}`);
  return res.data;
}
