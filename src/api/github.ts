import { getClient } from './client';

// The connect flow is now state-based: the backend mints a one-shot state token
// bound to the caller's workspace+user and returns the GitHub App install URL
// (with the correct, env-configured app slug) carrying that state. The browser
// install redirects to /github/install-callback, which completes the connection
// automatically — there is no separate "connect with installationId" call.
export async function getInstallUrl() {
  const res = await getClient().post('/github/install-state');
  return res.data as { state: string; installUrl: string };
}

export async function listInstallations() {
  const res = await getClient().get('/github/installations');
  return res.data;
}

export async function listRepositories() {
  const res = await getClient().get('/github/repositories');
  return res.data;
}

export async function listBranches(repositoryId: string) {
  const res = await getClient().get(`/github/repositories/${repositoryId}/branches`);
  return res.data;
}
