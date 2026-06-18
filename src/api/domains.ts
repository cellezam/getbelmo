import { getClient } from './client';

export async function attachDomain(deploymentId: string, domain: string) {
  const res = await getClient().post(`/deployments/${deploymentId}/domains`, { domain });
  return res.data;
}

export async function verifyDomain(deploymentId: string, domainId: string) {
  const res = await getClient().post(`/deployments/${deploymentId}/domains/${domainId}/verify`);
  return res.data;
}

export async function listDomains(deploymentId: string) {
  const res = await getClient().get(`/deployments/${deploymentId}/domains`);
  return res.data;
}
