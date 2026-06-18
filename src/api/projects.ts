import { getClient } from './client';

export async function createProject(name: string) {
  const res = await getClient().post('/projects', { name });
  return res.data;
}

export async function listProjects() {
  const res = await getClient().get('/projects');
  return res.data;
}
