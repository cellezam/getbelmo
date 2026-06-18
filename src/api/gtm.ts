import { getClient } from './client';

export interface CreateGtmServiceParams {
  name: string;
  containerConfig: string;
}

export interface GtmServiceResult {
  gtmServiceId: string;
  taggingFqdn: string;
  previewFqdn: string;
}

export async function createGtmService(params: CreateGtmServiceParams): Promise<GtmServiceResult> {
  const res = await getClient().post('/gtm', params);
  return res.data;
}

export async function listGtmServices() {
  const res = await getClient().get('/gtm');
  return res.data;
}

export async function getGtmService(id: string) {
  const res = await getClient().get(`/gtm/${id}`);
  return res.data;
}

export async function redeployGtmService(id: string) {
  const res = await getClient().post(`/gtm/${id}/redeploy`);
  return res.data;
}

export async function updateGtmContainerConfig(id: string, containerConfig: string) {
  const res = await getClient().patch(`/gtm/${id}/container-config`, { containerConfig });
  return res.data;
}

export async function deleteGtmService(id: string) {
  const res = await getClient().delete(`/gtm/${id}`);
  return res.data;
}
